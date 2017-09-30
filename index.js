const path = require('path')
const { readFile } = require('mz/fs')
const { modifyNodes } = require('reshape-plugin-util')

const pReduce = require('p-reduce')

const expectAttribute = (node, attribute, { PluginError }) => {
  if (!(node && node.attrs && node.attrs[attribute])) {
    throw new PluginError({
      plugin: 'reshape-components',
      message: `${node.name} tag is missing a "${attribute}" attribute`,
      location: node.location
    })
  }
}

const compileComponent = (src, ctx, props) =>
  readFile(src, 'utf8')
    .then(text => ctx.parser(text, ctx.filename))
    .then(componentTree =>
      pReduce(
        ctx.plugins,
        (currentCode, plugin) => plugin(currentCode, ctx),
        componentTree
      )
    )
    .then(codeContent => props => ({
      type: 'code',
      content: `function () {
          const props = ${JSON.stringify(props)}
          return __nodes[0]
        }()`,
      nodes: [codeContent]
    }))

const getImportedComponents = (ast, ctx, opts) => {
  const importedComponents = {}
  const promises = []
  return modifyNodes(
    ast,
    n => n.name === 'import',
    node => {
      expectAttribute(node, 'src', ctx)
      expectAttribute(node, 'as', ctx)
      const resolveRoot =
        opts.root || (ctx.filename && path.dirname(ctx.filename)) || ''
      const src = path.join(resolveRoot, node.attrs.src[0].content)
      const name = node.attrs.as[0].content
      // add dependency if applicable
      if (ctx.dependencies) {
        ctx.dependencies.push({
          file: src,
          parent: ctx.filename
        })
      }
      promises.push(
        compileComponent(src, ctx).then(component => {
          importedComponents[name.toLowerCase()] = component
        })
      )
      return ''
    }
  )
    .then(newAst => Promise.all(promises).then(() => newAst))
    .then(ast => ({ importedComponents, ast }))
}

const main = (opts = {}) => (ast, ctx) => {
  return getImportedComponents(
    ast,
    ctx,
    opts
  ).then(({ importedComponents, ast }) =>
    modifyNodes(
      ast,
      n => n.name in importedComponents,
      node => {
        const props = { children: ctx.generator(node.content)() }
        Object.keys(node.attrs).map(prop => {
          const value = node.attrs[prop]
          props[prop] = ctx.generator(value)()
        })
        return importedComponents[node.name](props)
      }
    )
  )
}

module.exports = main

const path = require('path')
const { readFile } = require('mz/fs')
const { modifyNodes } = require('reshape-plugin-util')

const plugin = 'reshape-components'
const pReduce = require('p-reduce')

const compileComponent = (src, ctx, props) =>
  readFile(src, 'utf8')
    .then(ctx.parser)
    .then(componentTree =>
      pReduce(
        ctx.plugins,
        (currentCode, plugin) => plugin(currentCode, ctx),
        componentTree
      )
    )
    .then(codeContent => props => {
      const expression = `function () {
        const props = ${JSON.stringify(props)}
        return __nodes[0]
      }()`
      return {
        type: 'code',
        content: expression,
        nodes: [codeContent]
      }
    })

const getImportedComponents = (ast, ctx, opts) => {
  const importedComponents = {}
  const promises = []
  return modifyNodes(
    ast,
    n => n.name === 'import',
    node => {
      // if there is no src, throw an error
      if (!(node.attrs && node.attrs.src)) {
        throw new ctx.PluginError({
          message: 'import tag has no "src" attribute',
          plugin,
          location: node.location
        })
      }
      if (!(node.attrs && node.attrs.as)) {
        throw new ctx.PluginError({
          message: 'import tag has no "as" attribute',
          plugin,
          location: node.location
        })
      }
      const resolveRoot =
        opts.root || (ctx.filename && path.dirname(ctx.filename)) || ''
      const src = path.join(resolveRoot, node.attrs.src[0].content)
      const name = node.attrs.as[0].content
      promises.push(
        compileComponent(src, ctx).then(component => {
          importedComponents[name.toLowerCase()] = component
        })
      )
      return null
    }
  )
    .then(() => Promise.all(promises))
    .then(() => importedComponents)
}

const main = (opts = {}) => (ast, ctx) => {
  return getImportedComponents(ast, ctx, opts).then(importedComponents =>
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

import components from '.'
import path from 'path'
import fs from 'mz/fs'
import reshape from 'reshape'
import expressions from 'reshape-expressions'

const fixture = async name => {
  const root = path.join(__dirname, 'fixtures', name)
  const filename = path.join(root, 'input.html')
  const input = (await fs.readFile(filename)).toString()
  return reshape({
    plugins: [components({ root }), expressions()]
  })
    .process(input)
    .then(result => result.output({ foo: 'caleb' }))
}

test('uses component from other file', async () => {
  expect(await fixture('component')).toMatchSnapshot()
})

test('passes locals into component file', async () => {
  expect(await fixture('locals')).toMatchSnapshot()
})

describe('import element', () => {
  test('should throw if "src" attribute is missing', () => {
    return expect(fixture('no-src')).rejects.toHaveProperty(
      'message',
      `import tag is missing a "src" attribute
From Plugin: reshape-components
Location: [no filename]:1:1

 > 1 | <Import as="FooBar"/>
     | ^
`
    )
  })
  test('should throw if "as" attribute is missing', () => {
    return expect(fixture('no-as')).rejects.toHaveProperty(
      'message',
      `import tag is missing a "as" attribute
From Plugin: reshape-components
Location: [no filename]:1:1

 > 1 | <Import src="./foobar.html"/>
     | ^
`
    )
  })
})

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
    .then(result => result.output())
}

test('uses component from other file', async () => {
  expect(await fixture('component')).toMatchSnapshot()
})

describe('import element', () => {
  test('should throw if "src" attribute is missing', () => {
    return expect(fixture('no-src')).rejects.toHaveProperty(
      'message',
      `import tag has no "src" attribute
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
      `import tag has no "as" attribute
From Plugin: reshape-components
Location: [no filename]:1:1

 > 1 | <Import src="./foobar.html"/>
     | ^
`
    )
  })
})

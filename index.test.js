import components from '.'
import path from 'path'
import fs from 'mz/fs'
import reshape from 'reshape'
import expressions from 'reshape-expressions'

const fixture = name => async () => {
  const root = path.join(__dirname, 'fixtures', name)
  const filename = path.join(root, 'input.html')
  const input = (await fs.readFile(filename)).toString()
  const output = await reshape({
    plugins: [components({ root }), expressions()]
  })
    .process(input)
    .then(result => result.output())
  expect(output).toMatchSnapshot()
}

test('uses component from other file', fixture('component'))

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

# Reshape Components

[![Greenkeeper badge](https://badges.greenkeeper.io/calebeby/reshape-components.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/calebeby/reshape-components.svg?branch=master)](https://travis-ci.org/calebeby/reshape-components)
[![codecov](https://codecov.io/gh/calebeby/reshape-components/branch/master/graph/badge.svg)](https://codecov.io/gh/calebeby/reshape-components)

## Usage

Input:

> foobar.html
```html
<Component name="FooBar">
  <div class="g-foobar">
    <h1>This is a foobar called {{ props.title }}</h1>
    {{{ props.children }}}
    <h2>otherProp is {{ props.otherProp }}</h2>
  </div>
</Component>
```

> main.html
```html
<Import src="./foobar.html" />
<FooBar title="this is the title" otherProp="5">
  <p>Child Here</p>
</FooBar>
```

Processed as such:
```javascript
const { readFileSync } = require('fs')
const reshape = require('reshape')
const components = require('reshape-components')
const expressions = require('reshape-expressions')

const main = readFileSync('main.html')

reshape({ plugins: [components(), expressions()] })
  .process(main)
  .then((result) => console.log(result.output()))
```

Results in:

```html
<div class="g-foobar">
  <h1>This is a foobar called "this is the title"</h1>
  <p>Child Here</p>
  <h2>otherProp is 5</h2>
</div>
```

## Installation

### NPM
```
npm i -s reshape-components
```

### Yarn
```
yarn add reshape-components
```

## License: [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
Copyright 2017 Caleb Eby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

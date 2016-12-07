# Webpack web-components-loader

[![Build Status](https://travis-ci.org/rnicholus/web-components-loader.svg?branch=master)](https://travis-ci.org/rnicholus/web-components-loader)
[![npm](https://img.shields.io/npm/v/web-components-loader.svg)](https://www.npmjs.com/package/web-components-loader)
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)

> A Webpack loader that makes it incredibly easy to import multi-file Web Components into your project.

Importing a Web Component that consists of a single JavaScript file isn't particularly difficult, but what about Web Components that require HTML imports which themselves import various other JavaScript, CSS, and other HTML files? This is more more complicated, and, before web-components-loader, involved a lot of manual intervention. 

Simply `import` or `require` the HTML file for the web component you'd like to pull into your project. The loader does the following for you:

1. Copies the HTML file and all of its dependencies to a namespaced location in your public/output directory. It determines the Web Component's dependencies by parsing the tree of files, starting with the root HTML file.
2. Optionally minifies all related HTML, CSS, and JavaScript files.
3. Makes it simple to transpile the JavaScript files associated with your Web Component, or augment them in any other way you choose, using an intutive callback mechanism.
4. Watches all files associated with your Web Component and triggers a rebuild whenever any of them change (assuming the Webpack watcher is running).
5. Returns the location of the public path to the root HTML file. You can then add this to an HTML import element in your project.

## Installing

This will install the loader and update your `package.json` file with the appropriate entry/version:

```bash
npm install web-components-loader --save-dev
```

## Configuration

All configuration lives inside of your Webpack configuration file.

### Query parameters

All query parameters are sub-properties of the loader's `query` property:

- `minify` - `true` to minify all HTML, JS, and CSS files for imported Web Components

- `outputPath` - This takes presedence over the `ouput.path` property specified elsewhere in your Webpack config. Specify this param to override the output path used by the loader when writing out your Web Component files.

- `outputPublicPath` - This takes presedence over the `ouput.publicPath` property specified elsewhere in your Webpack config. Specify this param to override the output public path used by the loader when generating the public path returned by the loader.

### Options

If you'd like to augment/transpile the JavaScript files associated with an imported Web Compoenent, you can do so by defining a "callback" function as a sub-property of a root `webComponentsLoader` object in your Webpack configuration:

```js
webComponentsLoader: {
  transformJs: jsFileContents => {
    //...do something to the JS file contents string
    const newContents = transpile(jsFileContents)    

    return newContents
  }
}
```

## Simplest possible configuration

This will key on any imported/required HTML files inside a `web-components` directory:

```js
// webpack.config.js

module.exports = {
  entry: {
    main: '/src/main.js'
  },
  output: {
    path: '/public',
    publicPath: '/public',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: /web-components\//,
        loader: 'web-components-loader'
      }
    ]
  }
}
```

For example:

```js
// main.js

var htmlHrefPath = require('/src/web-components/my-component.html')

var importEl = document.createElement('link')
importEl.rel = 'import'
importEl.href = htmlHrefPath

document.body.appendChild(importEl)
```

## Minifying all imported Web Component HTML, CSS, and JS files

```js
{
  test: /web-components\//,
  loader: 'web-components-loader',
  query: {
    minify: true
  }
}
```

## Transpiling Web Component JS Files

```js
// webpack.config.js

var babel = require('babel-core')

module.exports = {
  entry: {
    main: '/src/main.js'
  },
  output: {
    path: '/public',
    publicPath: '/public',
    filename: '[name].bundle.js'
  },
  webComponentsLoader: {
    transformJs: rawCode => {
      return babel.transform(rawCode, {
        presets: ['es2015']
      }).code;
    },
  },
  module: {
    loaders: [
      {
        test: /web-components\//,
        loader: 'web-components-loader'
      }
    ]
  }
}
```

## Using Web Components with React

This loader works very well with the [React Web Component Wrapper](https://github.com/rnicholus/react-web-component-wrapper) component, which allows you to use Web Components using familiar React conventions. See the wrapper project for details, but integration may look something like this (provided you have already configured Webpack as described above):

```jsx
import React, { Component } from 'react'
import webComponentHref from 'file-input-web-component/file-input.html'
import FileInput from 'web-component-wrapper'

const extensions = [
  'jpg',
  'jpeg'
]

class FileInputDemo extends Component {
  render() {
    return (
      <FileInput extensions={ extensions }
                 onChange={ event => console.log(event.detail) }
                 webComponentHtmlHref={ webComponentHref }
                 webComponentName='file-input'
      >
        Select Files
      </FileInput>
    )
  }
}

export default FileInputDemo
```

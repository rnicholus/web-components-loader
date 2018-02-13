// web-components-loader Copyright © 2016 Ray Nicholus
const DOMParser = require('xmldom').DOMParser
const fs = require('fs')
const loaderUtils = require('loader-utils')
const minifyHtml = require('html-minifier').minify
const mkdirp = require('mkdirp')
const path = require('path')
const remotePathPattern = new RegExp('^(?:[a-z]+:)?//', 'i')
const uglifyCss = require('uglifycss')
const uglifyJs = require('uglify-js')

module.exports = function(htmlFileContent) {
    const filesToEmit =
        [this.resourcePath].concat(
            getLocalDependencies(htmlFileContent, this.context)
        )

    const emittedOutputPaths = []

    const resourceDirName = this.context.split('/').pop()

    const htmlFileNameSansExt = this.resourcePath.split('/').pop().slice(0, -5)

    const parsedQuery = loaderUtils.parseQuery(this.query)

    const outputPath = parsedQuery.outputPath == null
        ? this.options.output.path
        : '/'
    
    const outputPublicPath = parsedQuery.outputPublicPath == null
        ? this.options.output.publicPath
        : parsedQuery.outputPublicPath

    const localOutputDir = `${outputPath}/web-components`

    const minify = parsedQuery.minify

    const outputDir = `${localOutputDir}/${resourceDirName}`

    this.cacheable()

    filesToEmit.forEach(
        filePath => {
            'use strict'

            const relativePath = path.relative(this.context, filePath)
            const fileOutputPath = `${outputDir}/${relativePath}`
            const fileOutputDir = path.dirname(fileOutputPath)
            const rawContent = fs.readFileSync(filePath).toString()
            const transformJs = this.options.webComponentsLoader && this.options.webComponentsLoader.transformJs

            if (!fs.existsSync(fileOutputDir)) {
                mkdirp.sync(fileOutputDir)
            }

            let contentToOutput = rawContent

            if (transformJs && filePath.endsWith('.js')) {
                contentToOutput = transformJs(contentToOutput)
            }

            if (minify) {
                contentToOutput = getMinifiedOutput(filePath, contentToOutput)
            }

            fs.writeFileSync(fileOutputPath, contentToOutput)
            this.addDependency(filePath)
            emittedOutputPaths.push(fileOutputPath)
        }
    )

    const htmlImportPath = `${outputPublicPath}web-components/${resourceDirName}/${htmlFileNameSansExt}.html`
    return `module.exports = '${htmlImportPath}'`
}

const getLocalDependencies = (htmlFileContent, htmlFilePath) => {
    const htmlFileDoc = new DOMParser().parseFromString(htmlFileContent, 'text/html')
    const localDependencies = []

    Array.from(htmlFileDoc.getElementsByTagName('link')).forEach(
        linkEl => {
            const href = linkEl.getAttribute('href')

            // iff this is a local path
            if (href.trim() && !remotePathPattern.test(href)) {
                const relativePath = path.join(htmlFilePath, href)

                localDependencies.push(relativePath)

                // getLocalDependencies of this imported HTML file too
                if (linkEl.getAttribute('rel') === 'import') {
                    const childHtmlFileContent = fs.readFileSync(relativePath).toString()
                    const childHtmlFileDependencies = getLocalDependencies(childHtmlFileContent, path.dirname(relativePath))

                    localDependencies.push.apply(localDependencies, childHtmlFileDependencies)
                }
            }
        }
    )

    Array.from(htmlFileDoc.getElementsByTagName('script')).forEach(
        scriptEl => {
            const src = scriptEl.getAttribute('src')

            // iff this is a local path
            if (src.trim() && !remotePathPattern.test(src)) {
                localDependencies.push(path.join(htmlFilePath, src))
            }
        }
    )

    return localDependencies
}

const getMinifiedHtml = unminifiedHtml => {
    return minifyHtml(unminifiedHtml, {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
        processConditionalComments: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        trimCustomFragments: true
    })
}

const getMinifiedOutput = (filePath, code) => {
    if (filePath.endsWith('.html')) {
        return getMinifiedHtml(code)
    }
    else if (filePath.endsWith('.css')) {
        return uglifyCss.processString(code)
    }
    else if (filePath.endsWith('.js')) {
        return uglifyJs.minify(code, { fromString: true }).code
    }
}

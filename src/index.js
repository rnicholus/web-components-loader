// TODO mark dependant HTML/CSS/JS files to ensure recompile in watch mode if any of these change
// TODO ensure JS files can be transpiled, possibly <script> tags in imported HTML files too
// TODO tests

const DOMParser = require('xmldom').DOMParser
const fs = require('fs')
const loaderUtils = require('loader-utils')
const minifyHtml = require('html-minifier').minify
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

    const htmlFileNameSansExt = this.resourcePath.split('/').pop()

    const parsedQuery = loaderUtils.parseQuery(this.query)

    const localOutputDir = parsedQuery.output

    const minify = parsedQuery.minify

    const outputDir = `${localOutputDir}/${htmlFileNameSansExt}`

    filesToEmit.forEach(
        filePath => {
        'use strict'

        const relativePath = path.relative(this.context, filePath)
        const fileOutputPath = `${outputDir}/${relativePath}`
        const fileOutputDir = path.dirname(fileOutputPath)

        if (!fs.existsSync(fileOutputDir)) {
        fs.mkdirSync(fileOutputDir)
    }

    const contentToOutput = minify
        ? getMinifiedOutput(filePath)
        : fs.readFileSync(filePath)

    fs.writeFileSync(fileOutputPath, contentToOutput)
    emittedOutputPaths.push(fileOutputPath)
}
    )

    const htmlImportPath = emittedOutputPaths[0].split(localOutputDir + '/').pop()
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
            const childHtmlFileContent = fs.readFileSync(relativePath)
            const childHtmlFileDependencies = getLocalDependencies(childHtmlFileContent)

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
        removeStyleLinkTypeAttributes: true,
        trimCustomFragments: true
    })
}

const getMinifiedOutput = filePath => {
    const fileBuffer = fs.readFileSync(filePath)

    if (filePath.endsWith('.html')) {
        return getMinifiedHtml(fileBuffer.toString())
    }
    else if (filePath.endsWith('.css')) {
        return uglifyCss.processString(fileBuffer.toString())
    }
    else if (filePath.endsWith('.js')) {
        return uglifyJs.minify(filePath).code
    }
}
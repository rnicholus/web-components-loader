const path = require('path')
const loader = require(path.resolve('./src'))

const del = require('del')
const fs = require('fs')

const outputDir = 'spec/example-wcs/output'

describe('web-components-loader', () => {
    beforeEach(() => {
        del.sync([`${outputDir}/**`])
        fs.mkdirSync(outputDir)
    })

    describe('simple WC support', () => {
        const htmlPath = 'spec/example-wcs/simple/index.html'
        const htmlContent = fs.readFileSync(htmlPath).toString()
        const context = {
            addDependency: jasmine.createSpy('addDependency'),
            cacheable: () => {},
            context: 'spec/example-wcs/simple',
            options: {},
            query: `?output=${outputDir}`,
            resourcePath: htmlPath
        }

        it('copies the HTML file to the output dir and returns output path', () => {
            const outputPath = loader.call(context, htmlContent)

            expect(outputPath).toBe("module.exports = 'index.html/index.html'")
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/simple/index.html')
            expect(fs.existsSync(`${outputDir}/index.html`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/index.html`)).toBe(true)
        })
    })

    describe('WC with linked JS files', () => {
        const htmlPath = 'spec/example-wcs/linked-js-files/index.html'
        const htmlContent = fs.readFileSync(htmlPath).toString()
        const context = {
            addDependency: jasmine.createSpy('addDependency'),
            cacheable: () => {},
            context: 'spec/example-wcs/linked-js-files',
            options: {},
            query: `?output=${outputDir}`,
            resourcePath: htmlPath
        }

        it('copies the HTML & JS files to the output dir and returns output path to HTML file', () => {
            const outputPath = loader.call(context, htmlContent)

            expect(outputPath).toBe("module.exports = 'index.html/index.html'")
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/linked-js-files/index.html')
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/linked-js-files/index.js')
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/linked-js-files/foo/index.js')
            expect(fs.existsSync(`${outputDir}/index.html`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/index.html`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/index.js`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/foo/index.js`)).toBe(true)
        })
    })

    describe('WC with linked CSS files', () => {
        const htmlPath = 'spec/example-wcs/linked-css-files/index.html'
        const htmlContent = fs.readFileSync(htmlPath).toString()
        const context = {
            addDependency: jasmine.createSpy('addDependency'),
            cacheable: () => {},
            context: 'spec/example-wcs/linked-css-files',
            options: {},
            query: `?output=${outputDir}`,
            resourcePath: htmlPath
        }

        it('copies the HTML & CSS files to the output dir and returns output path to HTML file', () => {
            const outputPath = loader.call(context, htmlContent)

            expect(outputPath).toBe("module.exports = 'index.html/index.html'")
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/linked-css-files/index.html')
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/linked-css-files/index.css')
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/linked-css-files/foo/index.css')
            expect(fs.existsSync(`${outputDir}/index.html`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/index.html`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/index.css`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/foo/index.css`)).toBe(true)
        })
    })

    describe('WC with nested HTML imports', () => {
        const htmlPath = 'spec/example-wcs/nested-html-imports/index.html'
        const htmlContent = fs.readFileSync(htmlPath).toString()
        const context = {
            addDependency: jasmine.createSpy('addDependency'),
            cacheable: () => {},
            context: 'spec/example-wcs/nested-html-imports',
            options: {},
            query: `?output=${outputDir}`,
            resourcePath: htmlPath
        }

        it('copies the HTML, JS, and nested HTML files to the output dir and returns output path to root HTML file', () => {
            const outputPath = loader.call(context, htmlContent)

            expect(outputPath).toBe("module.exports = 'index.html/index.html'")
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/nested-html-imports/index.html')
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/nested-html-imports/other-wc/index.html')
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/nested-html-imports/other-wc/index.html')
            expect(fs.existsSync(`${outputDir}/index.html`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/index.html`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/other-wc/index.html`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/other-wc/index.js`)).toBe(true)
        })
    })
})
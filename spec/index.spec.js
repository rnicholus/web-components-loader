const path = require('path')
const loader = require(path.resolve('./src'))

const del = require('del')
const fs = require('fs')

const outputDir = 'spec/example-wcs/output'

describe('web-components-loader', () => {
    beforeEach(() => {
        del.sync([`${outputDir}/**`, `!${outputDir}`])
    })

    describe('simple WC support', () => {
        const simpleHtmlPath = 'spec/example-wcs/simple/index.html'
        const simpleIndexHtmlContent = fs.readFileSync(simpleHtmlPath).toString()
        const context = {
            addDependency: jasmine.createSpy('addDependency'),
            cacheable: () => {},
            context: 'spec/example-wcs/simple',
            options: {},
            query: `?output=${outputDir}`,
            resourcePath: simpleHtmlPath
        }

        it('copies the HTML file to the output dir and returns output path', () => {
            const outputPath = loader.call(context, simpleIndexHtmlContent)

            expect(outputPath).toBe("module.exports = 'index.html/index.html'")
            expect(context.addDependency).toHaveBeenCalledWith('spec/example-wcs/simple/index.html')
            expect(fs.existsSync(`${outputDir}/index.html`)).toBe(true)
            expect(fs.existsSync(`${outputDir}/index.html/index.html`)).toBe(true)
        })
    })
})
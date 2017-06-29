'use strict'
const reactTemplates = require('../../src/reactTemplates')
const testUtils = require('./testUtils')
const readFileNormalized = testUtils.readFileNormalized
const path = require('path')
const fsUtil = require('../../src/fsUtil')
const fs = require('fs')

module.exports = {
    runTests(test, dataPath) {
        test('html tests', t => {
            const files = [
                'scope.rt',
                'scope-trailing-semicolon.rt',
                'scope-variable-references.rt',
                'lambda.rt',
                'eval.rt',
                'props.rt',
                'custom-element.rt',
                'style.rt',
                'concat.rt',
                'js-in-attr.rt',
                'props-class.rt',
                'rt-class.rt',
                'className.rt',
                'svg.rt',
                'virtual.rt',
                'scope-evaluated-after-repeat.rt',
                'scope-evaluated-after-repeat2.rt',
                'scope-evaluated-after-if.rt',
                'scope-obj.rt',
                'scope-reserved-tokens.rt',
                'repeat-literal-collection.rt',
                'include.rt'
            ]

            files.forEach(testFile => {
                const filename = path.join(dataPath, testFile)
                const options = {
                    readFileSync: fsUtil.createRelativeReadFileSync(filename),
                    modules: 'amd'
                }
                let actual = ''
                let equal = false
                try {
                    const html = fs.readFileSync(filename).toString()
                    const expected = testUtils.normalizeHtml(readFileNormalized(filename + '.html'))
                    const code = reactTemplates.convertTemplateToReact(html, options).replace(/\r/g, '')
                    actual = testUtils.normalizeHtml(testUtils.codeToHtml(code))
                    equal = t.equal(actual, expected, `${testFile}`)
                } catch (e) {
                    console.log(testFile, e)
                    t.fail(e)
                }
                if (!equal) {
                    fs.writeFileSync(filename + '.actual.html', actual)
                }
            })
            t.end()
        })
    }
}

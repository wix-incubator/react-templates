'use strict'

const utils = require('../../src/utils')

module.exports = {
    runTests(test) {
        test('test convertText', t => {
            const texts = [
                {input: '{}', expected: '()'},
                {input: "a {'b'}", expected: '"a "+(\'b\')'}
            ]
            t.plan(texts.length)
            texts.forEach(check)
            function check(testData) {
                const r = utils.convertText({}, {}, testData.input)
                t.equal(r, testData.expected)
            }
        })
    }
}

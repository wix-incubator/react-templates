'use strict'
const assert = require('assert')
const utils = require('../../src/utils')

describe('utils', () => {
    describe('#convertText', () => {
        it('should convert text successfully', () => {
            const texts = [
                {input: '{}', expected: '()'},
                {input: "a {'b'}", expected: '"a "+(\'b\')'}
            ]
            texts.forEach(check)
            function check(testData) {
                const r = utils.convertText({}, {}, testData.input)
                assert.equal(r, testData.expected)
            }
        })

        it('should fail', () => {
            const texts = [
                {input: '() => {}', expected: '"() => "+()'}
            ]
            texts.forEach(check)
            function check(testData) {
                const r = utils.convertText({}, {}, testData.input)
                assert.equal(r, testData.expected)
            }
        })
    })
})

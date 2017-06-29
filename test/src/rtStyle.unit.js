'use strict'
const assert = require('assert')
const rtStyle = require('../../src/rtStyle')

describe('rtStyle', () => {
    it('should convertBody style successfully', () => {
        const text = '.text { background-color: #00346E; padding: 3px; }'
        const expected = '{\n  "text": {\n    "backgroundColor": "#00346E",\n    "padding": 3\n  }\n}'
        const actual = rtStyle.convertBody(text)
        assert.equal(actual, expected)
    })
})

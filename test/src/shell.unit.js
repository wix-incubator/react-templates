'use strict'
const context = require('../../src/context')
const _ = require('lodash')
const path = require('path')
const assert = require('assert')

describe('rtStyle', () => {
    it('should convertBody style successfully', () => {
        it('should convertBody style successfully', () => {
            context.clear()
            assert.equal(context.hasErrors(), false)
            context.error('hi', '', 1, 1)
            assert.equal(context.hasErrors(), true)
            context.clear()
            assert.equal(context.hasErrors(), false)
        })

        it('test shell', () => {
            const shell = require('../../src/shell')
            const newContext = _.cloneDeep(context)
            let outputJSON = ''
            newContext.options.format = 'json'
            newContext.report = function (text) { outputJSON = text }
            let r = shell.printResults(newContext)
            assert.equal(r, 0)
            context.error('hi', '', 1, 1)
            r = shell.printResults(newContext)
            assert.equal(r, 1)
            const output = JSON.parse(outputJSON)
            assert.deepEqual(output, [{
                column: 1,
                endOffset: -1,
                file: null,
                index: -1,
                level: 'ERROR',
                line: 1,
                msg: 'hi',
                startOffset: -1
            }])
            context.clear()
        })

        it('test shell', () => {
            const filename = path.join(dataPath, 'div.rt')
            const cli = require('../../src/cli')
            const r = cli.execute(`${filename} -r --dry-run`)
            assert.equal(r, 0)
        })
    })
})

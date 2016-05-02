'use strict';
const context = require('../../src/context');
const _ = require('lodash');
const path = require('path');

module.exports = {
    runTests(test, dataPath) {
        test('test context', t => {
            context.clear();
            t.equal(context.hasErrors(), false);
            context.error('hi', '', 1, 1);
            t.equal(context.hasErrors(), true);
            context.clear();
            t.equal(context.hasErrors(), false);

            t.end();
        });

        test('test shell', t => {
            const shell = require('../../src/shell');
            const newContext = _.cloneDeep(context);
            let outputJSON = '';
            newContext.options.format = 'json';
            newContext.report = function (text) { outputJSON = text; };
            let r = shell.printResults(newContext);
            t.equal(r, 0);
            context.error('hi', '', 1, 1);
            r = shell.printResults(newContext);
            t.equal(r, 1);
            const output = JSON.parse(outputJSON);
            t.deepEqual(output, [{
                column: 1,
                endOffset: -1,
                file: null,
                index: -1,
                level: 'ERROR',
                line: 1,
                msg: 'hi',
                startOffset: -1
            }]);
            context.clear();
            t.end();
        });

        test('test shell', t => {
            const filename = path.join(dataPath, 'div.rt');
            const cli = require('../../src/cli');
            const r = cli.execute(`${filename} -r --dry-run`);
            t.equal(r, 0);
            t.end();
        });
    }
};

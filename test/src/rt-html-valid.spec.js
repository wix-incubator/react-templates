'use strict';
// const _ = require('lodash');
const reactTemplates = require('../../src/reactTemplates');
const testUtils = require('./testUtils');
const readFileNormalized = testUtils.readFileNormalized;
const compareAndWriteHtml = testUtils.compareAndWriteHtml;
const path = require('path');
const fsUtil = require('../../src/fsUtil');
const fs = require('fs');

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
                'repeat-literal-collection.rt',
                'include.rt'
            ];
            // t.plan(files.length);

            files.forEach(testFile => {
                const filename = path.join(dataPath, testFile);
                const options = {
                    readFileSync: fsUtil.createRelativeReadFileSync(filename),
                    modules: 'amd'
                };
                let code = '';
                try {
                    const html = fs.readFileSync(filename).toString();
                    const expected = testUtils.normalizeHtml(readFileNormalized(`${filename}.html`));
                    code = reactTemplates.convertTemplateToReact(html, options).replace(/\r/g, '');
                    const actual = testUtils.normalizeHtml(testUtils.codeToHtml(code));
                    const equal = compareAndWriteHtml(t, actual, expected, filename);
                    if (!equal) {
                        fs.writeFileSync(`${filename}.code.js`, code);
                    }
                } catch (e) {
                    console.log(testFile, e);
                    fs.writeFileSync(`${filename}.code.js`, code);
                    t.fail(e);
                }
            });
            t.end();
        });
    }
};

'use strict';
const reactTemplates = require('../../src/reactTemplates');
const testUtils = require('./testUtils');
const readFileNormalized = testUtils.readFileNormalized;
const compareAndWrite = testUtils.compareAndWrite;
const path = require('path');
const context = require('../../src/context');
const fsUtil = require('../../src/fsUtil');
const fs = require('fs');

module.exports = {
    runTests(test, dataPath) {
        function checkFile(t, options, testFile) {
            const filename = path.join(dataPath, testFile);
            const html = readFileNormalized(filename);
            const expected = readFileNormalized(filename + '.js');
            const actual = reactTemplates.convertTemplateToReact(html, options).replace(/\r/g, '').trim();
            compareAndWrite(t, actual, expected, filename);
        }

        function testFiles(t, files, options) {
            t.plan(files.length);
            files.forEach(checkFile.bind(this, t, options));
        }

        test('rt-if with rt-scope test', t => {
            const files = ['if-with-scope/valid-if-scope.rt'];
            testFiles(t, files);
        });

        test('conversion test', t => {
            const files = ['div.rt', 'test.rt', 'repeat.rt', 'repeat-with-index.rt', 'inputs.rt', 'virtual.rt', 'stateless.rt'];
            testFiles(t, files);
        });

        test('prop template conversion test', t => {
            const options = {
                propTemplates: {
                    List: {
                        Row: {prop: 'renderRow', arguments: ['rowData']}
                    }
                }
            };
            const files = ['propTemplates/simpleTemplate.rt', 'propTemplates/templateInScope.rt', 'propTemplates/implicitTemplate.rt', 'propTemplates/twoTemplates.rt'];
            testFiles(t, files, options);
        });

        test('conversion test - native', t => {
            const options = {
                propTemplates: {
                    MyComp: {
                        Row: {prop: 'renderRow', arguments: ['rowData']}
                    }
                },
                native: true
            };
            const files = ['native/nativeView.rt', 'native/listViewTemplate.rt', 'native/listViewAndCustomTemplate.rt'];
            testFiles(t, files, options);
        });

        test('convert div with all module types', t => {
            const files = [
                {source: 'div.rt', expected: 'div.rt.commonjs.js', options: {modules: 'commonjs'}},
                {source: 'div.rt', expected: 'div.rt.amd.js', options: {modules: 'amd', name: 'div'}},
                {source: 'div.rt', expected: 'div.rt.globals.js', options: {modules: 'none', name: 'div'}},
                {source: 'div.rt', expected: 'div.rt.es6.js', options: {modules: 'es6'}},
                {source: 'div.rt', expected: 'div.rt.typescript.ts', options: {modules: 'typescript'}}
            ];
            t.plan(files.length);
            files.forEach(check);

            function check(testData) {
                const filename = path.join(dataPath, testData.source);
                const html = readFileNormalized(filename);
                const expected = readFileNormalized(path.join(dataPath, testData.expected));
                const actual = reactTemplates.convertTemplateToReact(html, testData.options).replace(/\r/g, '').trim();
                compareAndWrite(t, actual, expected, filename);
            }
        });

        test('rt-require with all module types', t => {
            const files = [
                {source: 'require.rt', expected: 'require.rt.commonjs.js', options: {modules: 'commonjs'}},
                {source: 'require.rt', expected: 'require.rt.amd.js', options: {modules: 'amd', name: 'div'}},
                {source: 'require.rt', expected: 'require.rt.globals.js', options: {modules: 'none', name: 'div'}},
                {source: 'require.rt', expected: 'require.rt.es6.js', options: {modules: 'es6'}},
                {source: 'require.rt', expected: 'require.rt.typescript.ts', options: {modules: 'typescript'}}
            ];
            t.plan(files.length);
            files.forEach(check);

            function check(testData) {
                const filename = path.join(dataPath, testData.source);
                const html = readFileNormalized(filename);
                const expected = readFileNormalized(path.join(dataPath, testData.expected));
                const actual = reactTemplates.convertTemplateToReact(html, testData.options).replace(/\r/g, '').trim();
                compareAndWrite(t, actual, expected, filename);
            }
        });

        test('rt-import with all module types', t => {
            const files = [
                {source: 'import.rt', expected: 'import.rt.commonjs.js', options: {modules: 'commonjs'}},
                {source: 'import.rt', expected: 'import.rt.amd.js', options: {modules: 'amd', name: 'div'}},
                {source: 'import.rt', expected: 'import.rt.globals.js', options: {modules: 'none', name: 'div'}},
                {source: 'import.rt', expected: 'import.rt.es6.js', options: {modules: 'es6'}},
                {source: 'import.rt', expected: 'import.rt.typescript.ts', options: {modules: 'typescript'}}
            ];
            t.plan(files.length);
            files.forEach(check);

            function check(testData) {
                const filename = path.join(dataPath, testData.source);
                const html = readFileNormalized(filename);
                const expected = readFileNormalized(path.join(dataPath, testData.expected));
                const actual = reactTemplates.convertTemplateToReact(html, testData.options).replace(/\r/g, '').trim();
                compareAndWrite(t, actual, expected, filename);
            }
        });

        test('convert jsrt and test source results', t => {
            const files = ['simple.jsrt'];
            t.plan(files.length);
            files.forEach(check);

            function check(file) {
                const filename = path.join(dataPath, file);
                const js = readFileNormalized(filename);
                const expected = readFileNormalized(path.join(dataPath, file.replace('.jsrt', '.js')));
                const actual = reactTemplates.convertJSRTToJS(js, context).replace(/\r/g, '').trim();
                compareAndWrite(t, actual, expected, filename);
            }
        });

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
            t.plan(files.length);

            files.forEach(check);

            function check(testFile) {
                const filename = path.join(dataPath, testFile);
                const options = {
                    readFileSync: fsUtil.createRelativeReadFileSync(filename)
                };
                let code = '';
                try {
                    const html = fs.readFileSync(filename).toString();
                    const expected = testUtils.normalizeHtml(readFileNormalized(filename + '.html'));
                    code = reactTemplates.convertTemplateToReact(html, options).replace(/\r/g, '');
                    const actual = testUtils.normalizeHtml(testUtils.codeToHtml(code));
                    const equal = compareAndWrite(t, actual, expected, filename);
                    if (!equal) {
                        fs.writeFileSync(filename + '.code.js', code);
                    }
                } catch (e) {
                    console.log(testFile, e);
                    fs.writeFileSync(filename + '.code.js', code);
                }
            }
        });
    }
};

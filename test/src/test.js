'use strict';
const test = require('tape');
const reactTemplates = require('../../src/reactTemplates');
const context = require('../../src/context');
const util = require('./util');
const fsUtil = require('../../src/fsUtil');
const readFileNormalized = util.readFileNormalized;
const compareAndWrite = util.compareAndWrite;
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const RTCodeError = reactTemplates.RTCodeError;
const dataPath = path.resolve(__dirname, '..', 'data');

const invalidFiles = [
    {file: 'if-with-scope/invalid-if-scope-1.rt', issue: new RTCodeError("invalid scope mapping used in if part 'this.bar(activeUsers.length)'", 0, 160, 1, 1)},
    {file: 'if-with-scope/invalid-if-scope-2.rt', issue: new RTCodeError("invalid scope mapping used in if part 'this.bar[activeUsers || 0]'", 0, 158, 1, 1)},
    {file: 'if-with-scope/invalid-if-scope-3.rt', issue: new RTCodeError("invalid scope mapping used in if part 'this.foo + activeUsers.length > this.bar'", 0, 172, 1, 1)},
    {file: 'if-with-scope/invalid-if-scope-4.rt', issue: new RTCodeError("invalid scope mapping used in if part 'getCurrentActiveUsers().length'", 0, 170, 1, 1)},
    {file: 'if-with-scope/invalid-if-scope-5.rt', issue: new RTCodeError("invalid scope mapping used in if part 'this.bar({activeUsers})'", 0, 155, 1, 1)},
    {file: 'invalid-scope.rt', issue: new RTCodeError("invalid scope part 'a in a in a'", 0, 35, 1, 1)},
    {file: 'invalid-html.rt', issue: new RTCodeError('Document should have a root element', -1, -1, -1, -1)},
    {file: 'invalid-exp.rt', issue: new RTCodeError("Failed to parse text '\n    {z\n'", 5, 13, 1, 6)},
    {file: 'invalid-lambda.rt', issue: new RTCodeError("when using 'on' events, use lambda '(p1,p2)=>body' notation or use {} to return a callback function. error: [onClick='']", 0, 23, 1, 1)},
    {file: 'invalid-js.rt', issue: new RTCodeError('Unexpected token ILLEGAL', 0, 32, 1, 1)},
    {file: 'invalid-single-root.rt', issue: new RTCodeError('Document should have no more than a single root element', 12, 23, 2, 1)},
    {file: 'invalid-repeat.rt', issue: new RTCodeError('rt-repeat invalid \'in\' expression \'a in b in c\'', 0, 35, 1, 1)},
    {file: 'invalid-rt-require.rt', issue: new RTCodeError("rt-require needs 'dependency' and 'as' attributes", 0, 14, 1, 1)},
    {file: 'invalid-brace.rt', issue: new RTCodeError('Unexpected end of input', 128, 163, 5, 11)},
    {file: 'invalid-style.rt', issue: new RTCodeError('Unexpected token ILLEGAL', 10, 39, 2, 5)},
    {file: 'invalid-virtual.rt', issue: new RTCodeError('Document should not have <rt-virtual> as root element', 0, 60, 1, 1)}
];

test('invalid tests', t => {
    t.plan(invalidFiles.length);

    invalidFiles.forEach(check);

    function check(testFile) {
        const filename = path.join(dataPath, testFile.file);
        const html = util.readFileNormalized(filename);
        let error = null;
        try {
            reactTemplates.convertTemplateToReact(html);
        } catch (e) {
            error = e;
        }
        t.deepEqual(omitStack(error), omitStack(testFile.issue), 'Expect convertTemplateToReact to throw an error');
    }
});

function omitStack(err) {
    return _.omit(err, 'stack', 'toIssue');
}

/**
 * @param {ERR} err
 * @return {ERR}
 */
function normalizeError(err) {
    err.msg = err.msg.replace(/\r/g, '');
    return err;
}

test('invalid tests json', t => {
    const cli = require('../../src/cli');
    t.plan(invalidFiles.length);

    invalidFiles.forEach(check);

    function check(testFile) {
        context.clear();
        const filename = path.join(dataPath, testFile.file);
        const options = {format: 'json', force: true};
        cli.handleSingleFile(options, filename);
        t.deepEqual(normalizeError(context.getMessages()[0]), errorEqualMessage(testFile.issue, filename), 'Expect cli to produce valid output messages');
    }
});

/**
 * @typedef {{index: number, line: number, column: number, msg: string, level: string, file: string}} ERR
 */

/**
 * @param {RTCodeError} err
 * @param {string} file
 * @return {ERR}
 */
function errorEqualMessage(err, file) {
    return {
        index: err.index,
        line: err.line,
        column: err.column,
        startOffset: err.startOffset,
        endOffset: err.endOffset,
        msg: err.message,
        level: 'ERROR',
        file
    };
}

test('rt-if with rt-scope test', t => {
    const files = ['if-with-scope/valid-if-scope.rt'];
    testFiles(t, files);
});

test('conversion test', t => {
    const files = ['div.rt', 'test.rt', 'repeat.rt', 'inputs.rt', 'require.rt'];
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

test('conversion test - native', t => {
    const options = {
        propTemplates: {
            MyComp: {
                Row: {prop: 'renderRow', arguments: ['rowData']}
            }
        },
        native: true
    };
    const files = ['nativeView.rt', 'listViewTemplate.rt', 'listViewAndCustomTemplate.rt'];
    testFiles(t, files, options);
});

test('convert div with all module types', t => {
    const files = [
        {source: 'div.rt', expected: 'div.rt.commonjs.js', options: {modules: 'commonjs'}},
        {source: 'div.rt', expected: 'div.rt.amd.js', options: {modules: 'amd', name: 'div'}},
        {source: 'div.rt', expected: 'div.rt.globals.js', options: {modules: 'none', name: 'div'}},
        {source: 'div.rt', expected: 'div.rt.es6.js', options: {modules: 'es6', name: 'div'}},
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
            const expected = util.normalizeHtml(readFileNormalized(filename + '.html'));
            code = reactTemplates.convertTemplateToReact(html, options).replace(/\r/g, '');
            const actual = util.normalizeHtml(util.codeToHtml(code));
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

test('test convertText', t => {
    const texts = [
        {input: '{}', expected: '()'},
        {input: "a {'b'}", expected: '"a "+(\'b\')'}
    ];
    t.plan(texts.length);
    texts.forEach(check);
    function check(testData) {
        const r = reactTemplates._test.convertText({}, {}, testData.input);
        t.equal(r, testData.expected);
    }
});

test('util.isStale', t => {
    const a = path.join(dataPath, 'a.tmp');
    const b = path.join(dataPath, 'b.tmp');

    fs.writeFileSync(a, 'actual');
    fs.writeFileSync(b, 'actual');

    const mtime1 = new Date(1995, 11, 17, 3, 24, 0);
    fs.utimesSync(a, mtime1, mtime1);

    const mtime2 = new Date(1995, 11, 17, 3, 24, 1);
    fs.utimesSync(b, mtime2, mtime2);

    let actual = fsUtil.isStale(a, b);
    t.equal(actual, false);
    actual = fsUtil.isStale(b, a);
    t.equal(actual, true);

    fs.unlinkSync(a);
    fs.unlinkSync(b);
    t.end();
});

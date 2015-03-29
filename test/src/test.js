'use strict';
var test = require('tape');
var reactTemplates = require('../../src/reactTemplates');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var React = require('react/addons');
var cheerio = require('cheerio');
var RTCodeError = reactTemplates.RTCodeError;
var dataPath = path.resolve(__dirname, '..', 'data');

/**
 * @param {string} filename
 * @return {string}
 */
function readFileNormalized(filename) {
    return fs.readFileSync(filename).toString().replace(/\r/g, '').trim();
}

var invalidFiles = [
    {file: 'invalid-scope.rt', issue: new RTCodeError("invalid scope part 'a in a in a'", 0, 35, 1, 1)},
    {file: 'invalid-html.rt', issue: new RTCodeError('Document should have a root element', -1, -1, -1, -1)},
    {file: 'invalid-exp.rt', issue: new RTCodeError("Failed to parse text '\n    {z\n'", 5, 13, 1, 6)},
    {file: 'invalid-lambda.rt', issue: new RTCodeError("when using 'on' events, use lambda '(p1,p2)=>body' notation or use {} to return a callback function. error: [onClick='']", 0, 23, 1, 1)},
    {file: 'invalid-js.rt', issue: new RTCodeError('Unexpected token ILLEGAL', 0, 32, 1, 1)},
    {file: 'invalid-single-root.rt', issue: new RTCodeError('Document should have no more than a single root element', 12, 23, 2, 1)},
    {file: 'invalid-repeat.rt', issue: new RTCodeError('rt-repeat invalid \'in\' expression \'a in b in c\'', 0, 35, 1, 1)},
    {file: 'invalid-rt-require.rt', issue: new RTCodeError("rt-require needs 'dependency' and 'as' attributes", 0, 14, 1, 1)},
    {file: 'invalid-brace.rt', issue: new RTCodeError('Unexpected end of input', 128, 163, 5, 11)},
    {file: 'invalid-style.rt', issue: new RTCodeError('Unexpected token ILLEGAL', 10, 39, 2, 5)}
];

test('invalid tests', function (t) {
    t.plan(invalidFiles.length);

    invalidFiles.forEach(check);

    function check(testFile) {
        var filename = path.join(dataPath, testFile.file);
        var html = readFileNormalized(filename);
        var error = null;
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

test('invalid tests json', function (t) {
    var cli = require('../../src/cli');
    var context = require('../../src/context');
    t.plan(invalidFiles.length);

    invalidFiles.forEach(check);

    function check(testFile) {
        context.clear();
        var filename = path.join(dataPath, testFile.file);
        var options = {format: 'json'};
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
        file: file
    };
}

test('conversion test', function (t) {
    var files = ['div.rt', 'test.rt', 'repeat.rt', 'inputs.rt', 'require.rt'];
    t.plan(files.length);
    files.forEach(check);

    function check(testFile) {
        var filename = path.join(dataPath, testFile);
        var html = readFileNormalized(filename);
        var expected = readFileNormalized(filename + '.js');
//        var expected = fs.readFileSync(filename.replace(".html", ".js")).toString();
        var actual = reactTemplates.convertTemplateToReact(html).replace(/\r/g, '').trim();
        compareAndWrite(t, actual, expected, filename);
    }
});

/**
 * @param {*} t
 * @param {string} actual
 * @param {string} expected
 * @param {string} filename
 */
function compareAndWrite(t, actual, expected, filename) {
    t.equal(actual, expected);
    if (actual !== expected) {
        fs.writeFileSync(filename + '.actual.js', actual);
    }
}

test('convert div with all module types', function (t) {
    var files = [
        {source: 'div.rt', expected: 'div.rt.commonjs.js', options: {modules: 'commonjs'}},
        {source: 'div.rt', expected: 'div.rt.amd.js', options: {modules: 'amd', name: 'div'}},
        {source: 'div.rt', expected: 'div.rt.globals.js', options: {modules: 'none', name: 'div'}},
        {source: 'div.rt', expected: 'div.rt.es6.js', options: {modules: 'es6', name: 'div'}},
        {source: 'div.rt', expected: 'div.rt.typescript.ts', options: {modules: 'typescript'}}
    ];
    t.plan(files.length);
    files.forEach(check);

    function check(testData) {
        var filename = path.join(dataPath, testData.source);
        var html = readFileNormalized(filename);
        var expected = readFileNormalized(path.join(dataPath, testData.expected));
//        var expected = fs.readFileSync(filename.replace(".html", ".js")).toString();
        var actual = reactTemplates.convertTemplateToReact(html, testData.options).replace(/\r/g, '').trim();
        compareAndWrite(t, actual, expected, filename);
    }
});

test('convert jsrt and test source results', function (t) {
    var files = ['simple.jsrt'];
    t.plan(files.length);
    files.forEach(check);

    function check(file) {
        var filename = path.join(dataPath, file);
        var js = readFileNormalized(filename);
        var expected = readFileNormalized(path.join(dataPath, file.replace('.jsrt','.js')));
//        var expected = fs.readFileSync(filename.replace(".html", ".js")).toString();
        var actual = reactTemplates.convertJSRTToJS(js).replace(/\r/g, '').trim();
        compareAndWrite(t, actual, expected, filename);
    }
});

/**
 * @param {string} html
 * @return {string}
 */
function normalizeHtml(html) {
    return cheerio.load(html, {normalizeWhitespace: true}).html()
        .replace(/\>\s+/mg, '>')
        .replace(/\s+\</mg, '<')
        .replace(/\>\s+\</mg, '><');
}

test('html tests', function (t) {
    var files = ['scope.rt', 'lambda.rt', 'eval.rt', 'props.rt', 'custom-element.rt', 'style.rt', 'concat.rt', 'js-in-attr.rt', 'props-class.rt'];
    t.plan(files.length);

    files.forEach(check);

    function check(testFile) {
        var filename = path.join(dataPath, testFile);
        var html = fs.readFileSync(filename).toString();
        var expected = readFileNormalized(filename + '.html');
//        var expected = fs.readFileSync(filename.replace(".html", ".js")).toString();
        var code = reactTemplates.convertTemplateToReact(html).replace(/\r/g, '');
        var defineMap = {'react/addons': React, lodash: _};
        /*eslint no-unused-vars:0*/
        var define = function (requirementsNames, content) {
            var requirements = _.map(requirementsNames, function (reqName) {
                return defineMap[reqName];
            });
            return content.apply(this, requirements);
        };
        var comp = React.createFactory(React.createClass({
            /* eslint no-eval:0 */
            render: eval(code)
        }));
        var actual = React.renderToStaticMarkup(comp());
        actual = normalizeHtml(actual);
        expected = normalizeHtml(expected);
        compareAndWrite(t, actual, expected, filename);
    }
});

test('test context', function (t) {
    var context = require('../../src/context');
    context.clear();
    t.equal(context.hasErrors(), false);
    context.error('hi', '', 1, 1);
    t.equal(context.hasErrors(), true);
    context.clear();
    t.equal(context.hasErrors(), false);

    t.end();
});

test('test shell', function (t) {
    var shell = require('../../src/shell');
    var context = require('../../src/context');
    var newContext = _.cloneDeep(context);
    var outputJSON;
    newContext.options.format = 'json';
    newContext.report = function (text) {
        outputJSON = text;
    };
    var r = shell.printResults(newContext);
    t.equal(r, 0);
    context.error('hi', '', 1, 1);
    r = shell.printResults(newContext);
    t.equal(r, 1);
    var output = JSON.parse(outputJSON);
    t.deepEqual(output, [{column: 1, endOffset: -1, file: null, index: -1, level: 'ERROR', line: 1, msg: 'hi', startOffset: -1}]);
    context.clear();
    t.end();
});

test('test shell', function (t) {
    var filename = path.join(dataPath, 'div.rt');
    var cli = require('../../src/cli');
    var r = cli.execute(filename + ' -r --dry-run');
    t.equal(r, 0);
    t.end();
});

test('test convertText', function (t) {
    var texts = [
        {input: '{}', expected: '()'},
        {input: "a {'b'}", expected: '"a "+(\'b\')'}
    ];
    t.plan(texts.length);
    texts.forEach(check);
    function check(testData) {
        var r = reactTemplates._test.convertText({}, {}, testData.input);
        t.equal(r, testData.expected);
    }
});

test('test convertText errors', function (t) {
    var texts = [
        {input: '{}', expected: '()'},
        {input: "a {'b'}", expected: '"a "+(\'b\')'}
    ];
    t.plan(texts.length);
    texts.forEach(check);
    function check(testData) {
        var r = reactTemplates._test.convertText({}, {}, testData.input);
        t.equal(r, testData.expected);
    }
});

test('util.isStale', function (t) {
    var a = path.join(dataPath, 'a.tmp');
    var b = path.join(dataPath, 'b.tmp');

    fs.writeFileSync(a, 'actual');
    fs.writeFileSync(b, 'actual');

    var mtime1 = new Date(1995, 11, 17, 3, 24, 0);
    fs.utimesSync(a, mtime1, mtime1);

    var mtime2 = new Date(1995, 11, 17, 3, 24, 1);
    fs.utimesSync(b, mtime2, mtime2);

    var fsUtil = require('../../src/fsUtil');
    var actual = fsUtil.isStale(a, b);
    t.equal(actual, false);
    actual = fsUtil.isStale(b, a);
    t.equal(actual, true);

    fs.unlinkSync(a);
    fs.unlinkSync(b);
    t.end();
});

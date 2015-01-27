'use strict';
var test = require('tape');
var reactTemplates = require('../../src/reactTemplates');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var React = require('react/addons');
var cheerio = require('cheerio');

var dataPath = path.resolve(__dirname, '..', 'data');

/**
 * @param {string} filename
 * @return {string}
 */
function readFileNormalized(filename) {
    return fs.readFileSync(filename).toString().replace(/\r/g, '').trim();
}

test('invalid tests', function (t) {
    var files = [
        {file: 'invalid-scope.rt', issue: new reactTemplates.RTCodeError("invalid scope part 'a in a in a'", -1, -1)},
        {file: 'invalid-html.rt', issue: new reactTemplates.RTCodeError('Document should have a root element', -1, -1)},
        {file: 'invalid-exp.rt', issue: new reactTemplates.RTCodeError("Failed to parse text '\n    {z\n'", 5, -1)},
        {
            file: 'invalid-lambda.rt',
            issue: new reactTemplates.RTCodeError("when using 'on' events, use lambda '(p1,p2)=>body' notation or use {} to return a callback function. error: [onClick='']", -1, -1)
        },
        {
            file: 'invalid-js.rt',
            issue: new reactTemplates.RTCodeError('Line 7: Unexpected token ILLEGAL', 187, undefined)
        },
        {
            file: 'invalid-single-root.rt',
            issue: new reactTemplates.RTCodeError('Document should have no more than a single root element', 12, 1)
        },
        {
            file: 'invalid-repeat.rt',
            issue: new reactTemplates.RTCodeError('rt-repeat invalid \'in\' expression \'a in b in c\'', -1, -1)
        },
        {
            file: 'invalid-rt-require.rt',
            issue: new reactTemplates.RTCodeError("rt-require needs 'dependency' and 'as' attributes", -1, -1)
        }
    ];
    t.plan(files.length);

    files.forEach(check);

    function check(testFile) {
        var filename = path.join(dataPath, testFile.file);
        var html = readFileNormalized(filename);
        var error = null;
        try {
            reactTemplates.convertTemplateToReact(html);
        } catch (e) {
            error = e;
        }
        t.deepEqual(errorEqual(error), errorEqual(testFile.issue), 'Expect convertTemplateToReact to throw an error');
    }
});

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
    var files = [
        {file: 'invalid-scope.rt', issue: new reactTemplates.RTCodeError("invalid scope part 'a in a in a'", -1, -1)},
        {file: 'invalid-html.rt', issue: new reactTemplates.RTCodeError('Document should have a root element', -1, -1)},
        {file: 'invalid-exp.rt', issue: new reactTemplates.RTCodeError("Failed to parse text '\n    {z\n'", 5, -1)},
        {
            file: 'invalid-lambda.rt',
            issue: new reactTemplates.RTCodeError("when using 'on' events, use lambda '(p1,p2)=>body' notation or use {} to return a callback function. error: [onClick='']", -1, -1)
        },
        {file: 'invalid-js.rt', issue: new reactTemplates.RTCodeError('Line 7: Unexpected token ILLEGAL', 187, -1)}
    ];
    t.plan(files.length);

    files.forEach(check);

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
        column: err.column || -1,
        msg: err.message,
        level: 'ERROR',
        file: file
    };
}

/**
 * @param {RTCodeError} err
 * @return {{index: number, line: number, message: string, name: string}}
 */
function errorEqual(err) {
    return {
        index: err.index,
        line: err.line,
        message: err.message,
        name: err.name
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

test('conversion test commonjs', function (t) {
    var files = [
        {source: 'div.rt', expected: 'div.rt.commonjs.js', options: {modules: 'commonjs'}},
        {source: 'div.rt', expected: 'div.rt.amd.js', options: {modules: 'amd', name: 'div'}},
        {source: 'div.rt', expected: 'div.rt.globals.js', options: {modules: 'none', name: 'div'}}
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
    var files = ['scope.rt', 'lambda.rt', 'eval.rt', 'props.rt', 'custom-element.rt', 'style.rt'];
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
    t.plan(3);

    var context = require('../../src/context');
    context.clear();
    t.equal(context.hasErrors(), false);
    context.error('hi', '', 1, 1);
    t.equal(context.hasErrors(), true);
    context.clear();
    t.equal(context.hasErrors(), false);
});

test('test shell', function (t) {
    t.plan(3);

    var shell = require('../../src/shell');
    var context = require('../../src/context');
    var newContext = _.cloneDeep(context);
    var output;
    newContext.options.format = 'json';
    newContext.report = function (text) {
        output = text;
    };
    var r = shell.printResults(newContext);
    t.equal(r, 0);
    context.error('hi', '', 1, 1);
    r = shell.printResults(newContext);
    t.equal(r, 1);
    t.equal(output, '[\n  {\n    "level": "ERROR",\n    "msg": "hi",\n    "file": null,\n    "line": 1,\n    "column": 1,\n    "index": -1\n  }\n]');
    context.clear();
});

test('test shell', function (t) {
    t.plan(1);

    var filename = path.join(dataPath, 'div.rt');
    var cli = require('../../src/cli');
    var r = cli.execute(filename + ' -r --dry-run');
    t.equal(r, 0);
});

test('util.isStale', function (t) {
    t.plan(2);
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
});

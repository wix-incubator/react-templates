'use strict';
var test = require('tape');
var reactTemplates = require('../../src/reactTemplates');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var React = require('react');
var cheerio = require('cheerio');

var dataPath = path.resolve(__dirname, '..', 'data');

test('conversion test', function (t) {
    var files = ['div.rt', 'test.rt', 'repeat.rt'];
    t.plan(files.length);

    files.forEach(check);

    function check(testFile) {
        var filename = path.join(dataPath, testFile);
        var html = fs.readFileSync(filename).toString();
        var expected = fs.readFileSync(filename + '.js').toString().replace(/\r/g, '').trim();
//        var expected = fs.readFileSync(filename.replace(".html", ".js")).toString();
        var actual = reactTemplates.convertTemplateToReact(html).replace(/\r/g, '').trim();
        t.equal(actual, expected);
        if (actual !== expected) {
            fs.writeFileSync(filename + '.actual.js', actual);
        }
    }
});

function normalizeHtml(html) {
    return cheerio.load(html, {normalizeWhitespace: true}).html()
        .replace(/\>\s+/mg, '>')
        .replace(/\s+\</mg, '<')
        .replace(/\>\s+\</mg, '><');
}

test('html tests', function (t) {
    var files = ['scope.rt', 'lambda.rt','eval.rt', 'props.rt'];
    t.plan(files.length);

    files.forEach(check);

    function check(testFile) {
        var filename = path.join(dataPath, testFile);
        var html = fs.readFileSync(filename).toString();
        var expected = fs.readFileSync(filename + '.html').toString().replace(/\r/g, '');
//        var expected = fs.readFileSync(filename.replace(".html", ".js")).toString();
        var code = reactTemplates.convertTemplateToReact(html).replace(/\r/g, '');
        var defineMap = {react: React, lodash: _};
        var define = function (requirementsNames, content) {
            var requirements = _.map(requirementsNames,function (reqName) {
                return defineMap[reqName];
            });
            return content.apply(this,requirements);
        };
        var comp = React.createFactory(React.createClass({
            render: eval(code)
        }));
        var actual = React.renderToStaticMarkup(comp());
        actual = normalizeHtml(actual);
        expected = normalizeHtml(expected);
        t.equal(actual, expected);
        if (actual !== expected) {
            fs.writeFileSync(filename + '.actual.html', actual);
        }
    }
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

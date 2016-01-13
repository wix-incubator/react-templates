'use strict';
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var reactTemplates = require('../../src/reactTemplates');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var _ = require('lodash');

/**
 * @param {string} html
 * @return {string}
 */
function normalizeHtml(html) {
    return cheerio.load(html, {normalizeWhitespace: true}).html()
        .replace(/>\s+/mg, '>')
        .replace(/\s+</mg, '<')
        .replace(/>\s+</mg, '><');
}

/**
 * @param {*} t
 * @param {string} actual
 * @param {string} expected
 * @param {string} filename
 * @return {boolean} whether actual is equal to expected
 */
function compareAndWrite(t, actual, expected, filename) {
    t.equal(actual, expected, filename);
    if (actual !== expected) {
        fs.writeFileSync(filename + '.actual.js', actual);
        return false;
    }
    return true;
}

/**
 * @param {string} filename
 * @return {string}
 */
function readFileNormalized(filename) {
    return readFile(filename).replace(/\r/g, '').trim();
}

//var dataPath = path.resolve(__dirname, '..', 'data');
/**
 * @param {string} filename
 * @return {string}
 */
function readFile(filename) {
    return fs.readFileSync(filename).toString();
}

function joinDataPath(fileName) {
    var dataPath = path.resolve(__dirname, '..', 'data');
    return path.join(dataPath, fileName);
}

function rtToHtml(rt) {
    var code = reactTemplates.convertTemplateToReact(rt).replace(/\r/g, '');
    return codeToHtml(code);
}

function codeToHtml(code) {
    var defineMap = {'react/addons': React, lodash: _};
    //noinspection JSUnusedLocalSymbols
    var define = function (requirementsNames, content) { //eslint-disable-line no-unused-vars,func-style
        var requirements = _.map(requirementsNames, reqName => defineMap[reqName]);
        return content.apply(this, requirements);
    };
    var comp = React.createFactory(React.createClass({
        displayName: 'testClass',
        render: eval(code) //eslint-disable-line no-eval
    }));
    return ReactDOMServer.renderToStaticMarkup(comp());
}

module.exports = {
    normalizeHtml: normalizeHtml,
    compareAndWrite: compareAndWrite,
    readFileNormalized: readFileNormalized,
    readFile: readFile,
    joinDataPath: joinDataPath,
    rtToHtml: rtToHtml,
    codeToHtml: codeToHtml
};

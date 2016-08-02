'use strict';
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const reactTemplates = require('../../src/reactTemplates');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const _ = require('lodash');

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
        fs.writeFileSync(`${filename}.actual.js`, actual);
        return false;
    }
    return true;
}

function compareNodes(t, a, b, filename) {
    _.forEach(a.attribs, (v, k) => {
        if (v !== b.attribs[k]) {
            console.log(`${v} is not ${b.attribs[k]}`);
        }
        t.equal(v, b.attribs[k], filename);
    });
    compareNodesList(t, a.children, b.children);
}

function compareNodesList(t, a, b, filename) {
    _.forEach(a, (v, i) => {
        compareNodes(t, v, b[i], filename);
    });
}

/**
 * @param {string} filename
 * @return {string}
 */
function readFileNormalized(filename) {
    return readFile(filename).replace(/\r/g, '').trim();
}

//const dataPath = path.resolve(__dirname, '..', 'data');
/**
 * @param {string} filename
 * @return {string}
 */
function readFile(filename) {
    return fs.readFileSync(filename).toString();
}

function joinDataPath(fileName) {
    const dataPath = path.resolve(__dirname, '..', 'data');
    return path.join(dataPath, fileName);
}

function rtToHtml(rt) {
    const code = reactTemplates.convertTemplateToReact(rt).replace(/\r/g, '');
    return codeToHtml(code);
}

function codeToHtml(code) {
    const defineMap = {react: React, lodash: _};
    //noinspection JSUnusedLocalSymbols
    const define = function (requirementsNames, content) { //eslint-disable-line no-unused-vars,func-style
        const requirements = _.map(requirementsNames, reqName => defineMap[reqName]);
        return content.apply(this, requirements);
    };
    const comp = React.createFactory(React.createClass({
        displayName: 'testClass',
        render: eval(code) //eslint-disable-line no-eval
    }));
    return ReactDOMServer.renderToStaticMarkup(comp());
}

module.exports = {
    normalizeHtml,
    compareAndWrite,
    readFileNormalized,
    readFile,
    joinDataPath,
    rtToHtml,
    codeToHtml
};

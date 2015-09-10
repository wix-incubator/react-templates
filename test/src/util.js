'use strict';
var cheerio = require('cheerio');
var fs = require('fs');

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
    return fs.readFileSync(filename).toString().replace(/\r/g, '').trim();
}

module.exports = {
    normalizeHtml: normalizeHtml,
    compareAndWrite: compareAndWrite,
    readFileNormalized: readFileNormalized
};
'use strict';
/**
 * @typedef {{color: boolean, cwd: string, report: function(string), warn: function(string), getMessages: function():Array.<MESSAGE>}} CONTEXT
 */
/**
 * @typedef {{msg: string, level: MESSAGE_LEVEL, file: string,line:number,column:number,startOffset:number,endOffset:number}} MESSAGE
 */

/**
 * Enum for tri-state values.
 * @enum {string}
 */
var MESSAGE_LEVEL = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO'
};

var _ = require('lodash');
var err = require('./RTCodeError');
var norm = err.RTCodeError.norm;


/**
 * @type {CONTEXT}
 */
var context = {
    /** @type {Array.<MESSAGE>} */
    messages: [],
    /** @type {boolean} */
    color: true,
    /** @type {string} */
    cwd: process.cwd(),
    report: function (msg) {
        console.log(msg);
    },
    info: function (msg, file, line, column) {
        context.issue(MESSAGE_LEVEL.INFO, msg, file, line, column);
    },
    warn: function (msg, file, line, column) {
        context.issue(MESSAGE_LEVEL.WARN, msg, file, line, column);
    },
    error: function (msg, file, line, column, startOffset, endOffset) {
        context.issue(MESSAGE_LEVEL.ERROR, msg, file, line, column, startOffset, endOffset);
    },
    /**
     * @param {MESSAGE_LEVEL} level
     * @param {string} msg
     * @param {string} file
     * @param {number} line
     * @param {number} column
     * @param {number=} startOffset
     * @param {number=} endOffset
     */
    issue: function (level, msg, file, line, column, startOffset, endOffset) {
        context.messages.push({level: level, msg: msg, file: file || null, line: norm(line), column: norm(column), index: norm(startOffset), startOffset: norm(startOffset), endOffset: norm(endOffset)});
    },
    getMessages: function () {
        return context.messages;
    },
    clear: function () {
        context.messages = [];
    },
    hasErrors: function () {
        return _.some(context.messages, {level: MESSAGE_LEVEL.ERROR});
    },
    options: {
        verbose: false,
        outFile: null,
        format: 'stylish'
    },
    MESSAGE_LEVEL: MESSAGE_LEVEL
};

module.exports = context;
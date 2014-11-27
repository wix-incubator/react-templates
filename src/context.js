'use strict';
/**
 * @typedef {{color: boolean, cwd: string, report: function(string), warn: function(string), getMessages: function():Array.<MESSAGE>}}
 */
var CONTEXT = null;
/**
 * @typedef {{msg: string, level: MESSAGE_LEVEL, file: string}}
 */
var MESSAGE = null;

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

/**
 * @type {CONTEXT}
 */
var context = {
    messages: [],
    color: true,
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
    error: function (msg, file, line, column, index) {
        context.issue(MESSAGE_LEVEL.ERROR, msg, file, line, column, index);
    },
    issue: function (level, msg, file, line, column, index) {
        context.messages.push({level: level, msg: msg, file: file || null, line: line || -1, column: column || -1, index: index || -1});
    },
    getMessages: function () {
        return context.messages;
    },
    clear: function () {
        context.messages = [];
    },
    hasErrors: function () {
        var firstError = _.find(context.messages, function(message) {
            return message.level === MESSAGE_LEVEL.ERROR;
        });
        return !!firstError;
    },
    options: {
        verbose: false,
        outFile: null,
        format: 'stylish'
    },
    MESSAGE_LEVEL: MESSAGE_LEVEL
};

module.exports = context;
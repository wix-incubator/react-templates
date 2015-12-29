'use strict';
var util = require('util');
var _ = require('lodash');


/**
 * @typedef {{line: number, col: number}} Pos
 */

/**
 * @param {string} html
 * @param node
 * @return {Pos}
 */
function getLine(html, node) {
    if (!node) {
        return {line: 1, col: 1};
    }
    var linesUntil = html.substring(0, node.startIndex).split('\n');
    return {line: linesUntil.length, col: linesUntil[linesUntil.length - 1].length + 1};
}

//function getLine(node) {
//    if (!node) {
//        return 0;
//    }
//    var line = 0;
//    var prev = node.prev;
//    while (prev) {
//        var nl = prev.data.split('\n').length - 1;
//        line += nl;
//        prev = prev.prev;
//    }
//
//    line += getLine(node.parent);
//    return line + 1;
//}

//function RTCodeError(message, line) {
//    this.name = 'RTCodeError';
//    this.message = message || '';
//    this.line = line || -1;
//}
//RTCodeError.prototype = Error.prototype;

// Redefine properties on Error to be enumerable
/*eslint no-extend-native:0*/
//Object.defineProperty(Error.prototype, 'message', {configurable: true, enumerable: true});
//Object.defineProperty(Error.prototype, 'stack', {configurable: true, enumerable: true});
//Object.defineProperty(Error.prototype, 'line', { configurable: true, enumerable: true });

/**
 * @param {string} message
 * @param {number=} startOffset
 * @param {number=} endOffset
 * @param {number=} line
 * @param {number=} column
 * @constructor
 */
class RTCodeError extends Error {
    constructor(message, startOffset, endOffset, line, column) {
        super();
        Error.captureStackTrace(this, RTCodeError);
        this.name = 'RTCodeError';
        this.message = message || '';
        this.index = norm(startOffset);
        this.startOffset = norm(startOffset);
        this.endOffset = norm(endOffset);
        this.line = norm(line);
        this.column = norm(column);
    }
    //build buildError
}

function norm(n) {
    return n === undefined ? -1 : n;
}

//const norm = n => n === undefined ? -1 : n;

/**
 * @type {buildError}
 */
RTCodeError.build = buildError;
RTCodeError.norm = norm;

/**
 * @param {*} context
 * @param {*} node
 * @param {string} msg
 * @param args
 * @return {RTCodeError}
 */
function buildFormat(context, node, msg, args) {
    return buildError(context, node, util.format.apply(this, [msg].concat(args)));
}

/**
 * @param {*} context
 * @param {*} node
 * @param {string} msg
 * @param {Array.<string>} args
 * @return {RTCodeError}
 */
RTCodeError.buildFormat = _.restParam(buildFormat, 3);

/**
 * @param {*} context
 * @param {*} node
 * @param {string} msg
 * @return {RTCodeError}
 */
function buildError(context, node, msg) {
    var loc = getNodeLoc(context, node);
    return new RTCodeError(msg, loc.start, loc.end, loc.pos.line, loc.pos.col);
}

/**
 * @param context
 * @param node
 * @return {{pos:Pos, start:number, end:number}}
 */
function getNodeLoc(context, node) {
    var pos = getLine(context.html, node);
    var end;
    if (node.data) {
        end = node.startIndex + node.data.length;
    } else if (node.next) { // eslint-disable-line
        end = node.next.startIndex;
    } else {
        end = context.html.length;
    }
    return {
        pos: pos,
        start: node.startIndex,
        end: end
    };
}

module.exports = {
    RTCodeError: RTCodeError,
    getNodeLoc: getNodeLoc
};

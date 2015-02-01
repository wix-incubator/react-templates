'use strict';

/**
 * @param {string} html
 * @param node
 * @return {{line: number, col: number}}}
 */
function getLine(html, node) {
    if (!node) {
        return {col: 1, line: 1};
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
Object.defineProperty(Error.prototype, 'message', {configurable: true, enumerable: true});
Object.defineProperty(Error.prototype, 'stack', {configurable: true, enumerable: true});
//Object.defineProperty(Error.prototype, 'line', { configurable: true, enumerable: true });

/**
 * @param {string} message
 * @param {number=} startOffset
 * @param {number=} endOffset
 * @param {number=} line
 * @param {number=} column
 * @constructor
 */
function RTCodeError(message, startOffset, endOffset, line, column) {
    Error.captureStackTrace(this, RTCodeError);
    this.name = 'RTCodeError';
    this.message = message || '';
    this.index = norm(startOffset);
    this.startOffset = norm(startOffset);
    this.endOffset = norm(endOffset);
    this.line = norm(line);
    this.column = norm(column);
}

function norm(n) {
    return n === undefined ? -1 : n;
}

RTCodeError.prototype = Object.create(Error.prototype);

RTCodeError.build = buildError;
RTCodeError.norm = norm;

RTCodeError.prototype.toIssue = function () {
};

/**
 * @param {string} msg
 * @param {*} context
 * @param {*} node
 * @return {RTCodeError}
 */
function buildError(msg, context, node) {
    var pos = getLine(context.html, node);
    var end;
    if (node.data) {
        end = node.startIndex + node.data.length;
    } else if (node.next) {
        end = node.next.startIndex;
    } else {
        end = context.html.length;
    }
    return new RTCodeError(msg, node.startIndex, end, pos.line, pos.col);
}

module.exports = {
    RTCodeError: RTCodeError
};

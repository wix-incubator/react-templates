'use strict'
const util = require('util')
const _ = require('lodash')


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
        return {line: 1, col: 1}
    }
    const linesUntil = html.substring(0, node.startIndex).split('\n')
    return {line: linesUntil.length, col: linesUntil[linesUntil.length - 1].length + 1}
}

/**
 * @param {number} n
 * @return {number}
 */
function norm(n) {
    return n === undefined ? -1 : n
}

/**
 *
 */
class RTCodeError extends Error {
    /**
     * @param {string} message
     * @param {number=} startOffset
     * @param {number=} endOffset
     * @param {number=} line
     * @param {number=} column
     */
    constructor(message, startOffset, endOffset, line, column) {
        super()
        Error.captureStackTrace(this, RTCodeError)
        this.name = 'RTCodeError'
        this.message = message || ''
        this.index = norm(startOffset)
        this.startOffset = norm(startOffset)
        this.endOffset = norm(endOffset)
        this.line = norm(line)
        this.column = norm(column)
    }
}

/**
 * @type {buildError}
 */
RTCodeError.build = buildError
RTCodeError.norm = norm

/**
 * @param {*} context
 * @param {*} node
 * @param {string} msg
 * @param args
 * @return {RTCodeError}
 */
function buildFormat(context, node, msg, args) {
    return buildError(context, node, util.format.apply(this, [msg].concat(args)))
}

/**
 * @param {*} context
 * @param {*} node
 * @param {string} msg
 * @param {Array.<string>} args
 * @return {RTCodeError}
 */
RTCodeError.buildFormat = _.rest(buildFormat, 3)

/**
 * @param {*} context
 * @param {*} node
 * @param {string} msg
 * @return {RTCodeError}
 */
function buildError(context, node, msg) {
    const loc = getNodeLoc(context, node)
    return new RTCodeError(msg, loc.start, loc.end, loc.pos.line, loc.pos.col)
}

/**
 * @param context
 * @param node
 * @return {{pos:Pos, start:number, end:number}}
 */
function getNodeLoc(context, node) {
    const start = node.startIndex
    const pos = getLine(context.html, node)
    let end
    if (node.data) {
        end = start + node.data.length
    } else if (node.next) { // eslint-disable-line
        end = node.next.startIndex
    } else {
        end = context.html.length
    }
    return {
        pos,
        start,
        end
    }
}

module.exports = {
    RTCodeError,
    getNodeLoc
}

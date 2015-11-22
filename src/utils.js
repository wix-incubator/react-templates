'use strict';
var _ = require('lodash');
var esprima = require('esprima-fb');
var rtError = require('./RTCodeError');
var RTCodeError = rtError.RTCodeError;

/**
 * @param {string} code
 * @param node
 * @param {Context} context
 */
function validateJS(code, node, context) {
    try {
        esprima.parse(code);
    } catch (e) {
        throw RTCodeError.build(e.description, context, node);
    }
}

/**
 * @param {string} name
 * @return {string}
 */
function normalizeName(name) {
    return name.replace(/-/g, '_');
}

/**
 * @param {string} txt
 * @return {boolean}
 */
function isStringOnlyCode(txt) {
    return /^\s*\{.*}\s*$/g.test(txt);
    //txt = txt.trim();
    //return txt.length && txt.charAt(0) === '{' && txt.charAt(txt.length - 1) === '}';
}

/**
 * @param {Array.<string>} children
 * @return {string}
 */
function concatChildren(children) {
    var res = '';
    _.forEach(children, function (child) {
        if (child && child.indexOf(' /*') !== 0) {
            res += ',';
        }
        res += child;
    });
    return res;
}

/**
 * validate rt
 * @param options
 * @param {*} context
 * @param {CONTEXT} reportContext
 * @param node
 */
function validate(options, context, reportContext, node) {
    if (node.type === 'tag' && node.attribs['rt-if'] && !node.attribs.key) {
        var loc = rtError.getNodeLoc(context, node);
        reportContext.warn('rt-if without a key', options.fileName, loc.pos.line, loc.pos.col, loc.start, loc.end);
    }
    if (node.children) {
        node.children.forEach(validate.bind(this, options, context, reportContext));
    }
}

module.exports = {
    normalizeName: normalizeName,
    validateJS: validateJS,
    isStringOnlyCode: isStringOnlyCode,
    concatChildren: concatChildren,
    validate: validate
};

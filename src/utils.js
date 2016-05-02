'use strict';
const _ = require('lodash');
const esprima = require('esprima');
const rtError = require('./RTCodeError');
const RTCodeError = rtError.RTCodeError;

/**
 * @param {string} code
 * @param node
 * @param {Context} context
 */
function validateJS(code, node, context) {
    try {
        esprima.parse(code);
    } catch (e) {
        throw RTCodeError.build(context, node, e.description);
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
 * @param {Array.<*>} array
 * @param {*} obj
 */
function addIfMissing(array, obj) {
    if (!_.includes(array, obj)) {
        array.push(obj);
    }
}

/**
 * @param {Array.<string>} children
 * @return {string}
 */
function concatChildren(children) {
    let res = '';
    _.forEach(children, child => {
        if (child && !_.startsWith(child, ' /*')) {
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
        const loc = rtError.getNodeLoc(context, node);
        reportContext.warn('rt-if without a key', options.fileName, loc.pos.line, loc.pos.col, loc.start, loc.end);
    }
    if (node.children) {
        node.children.forEach(validate.bind(this, options, context, reportContext));
    }
}

/**
 * return true if any node in the given tree uses a scope name from the given set, false - otherwise.
 * @param scopeNames a set of scope names to find
 * @param node root of a syntax tree generated from an ExpressionStatement or one of its children.
 */
function usesScopeName(scopeNames, node) {
    function usesScope(root) {
        return usesScopeName(scopeNames, root);
    }
    if (_.isEmpty(scopeNames)) {
        return false;
    }
    // rt-if="x"
    if (node.type === 'Identifier') {
        return _.includes(scopeNames, node.name);
    }
    // rt-if="e({key1: value1})"
    if (node.type === 'Property') {
        return usesScope(node.value);
    }
    // rt-if="e.x" or rt-if="e1[e2]"
    if (node.type === 'MemberExpression') {
        return node.computed ? usesScope(node.object) || usesScope(node.property) : usesScope(node.object);
    }
    // rt-if="!e"
    if (node.type === 'UnaryExpression') {
        return usesScope(node.argument);
    }
    // rt-if="e1 || e2" or rt-if="e1 | e2"
    if (node.type === 'LogicalExpression' || node.type === 'BinaryExpression') {
        return usesScope(node.left) || usesScope(node.right);
    }
    // rt-if="e1(e2, ... eN)"
    if (node.type === 'CallExpression') {
        return usesScope(node.callee) || _.some(node.arguments, usesScope);
    }
    // rt-if="f({e1: e2})"
    if (node.type === 'ObjectExpression') {
        return _.some(node.properties, usesScope);
    }
    // rt-if="e1[e2]"
    if (node.type === 'ArrayExpression') {
        return _.some(node.elements, usesScope);
    }
    return false;
}


/**
 * @const
 */
const curlyMap = {'{': 1, '}': -1};

/**
 * @typedef {{boundParams: Array.<string>, injectedFunctions: Array.<string>, html: string, options: *}} Context
 */

/**
 * @typedef {{fileName:string,force:boolean,modules:string,defines:*,reactImportPath:string=,lodashImportPath:string=,flow:boolean,name:string,native:boolean,propTemplates:*,format:string,_:*,version:boolean,help:boolean,listTargetVersion:boolean,modules:string, dryRun:boolean}} Options
 */

/**
 * @param node
 * @param {Context} context
 * @param {string} txt
 * @return {string}
 */
function convertText(node, context, txt) {
    let res = '';
    let first = true;
    const concatChar = node.type === 'text' ? ',' : '+';
    while (_.includes(txt, '{')) {
        const start = txt.indexOf('{');
        const pre = txt.substr(0, start);
        if (pre) {
            res += (first ? '' : concatChar) + JSON.stringify(pre);
            first = false;
        }
        let curlyCounter = 1;
        let end = start;
        while (++end < txt.length && curlyCounter > 0) {
            curlyCounter += curlyMap[txt.charAt(end)] || 0;
        }
        if (curlyCounter === 0) {
            const needsParens = start !== 0 || end !== txt.length - 1;
            res += (first ? '' : concatChar) + (needsParens ? '(' : '') + txt.substr(start + 1, end - start - 2) + (needsParens ? ')' : '');
            first = false;
            txt = txt.substr(end);
        } else {
            throw RTCodeError.build(context, node, `Failed to parse text '${txt}'`);
        }
    }
    if (txt) {
        res += (first ? '' : concatChar) + JSON.stringify(txt);
    }
    if (res === '') {
        res = 'true';
    }
    return res;
}


module.exports = {
    usesScopeName,
    normalizeName,
    validateJS,
    isStringOnlyCode,
    concatChildren,
    validate,
    addIfMissing,
    convertText
};

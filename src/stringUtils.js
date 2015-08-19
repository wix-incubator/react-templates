'use strict';
var _ = require('lodash');

/**
 * @param {string} str
 * @return {string}
 */
function convertToCamelCase(str) {
    return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

/**
 * @param {string} str
 * @return {string}
 */
function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
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

module.exports = {
    convertToCamelCase: convertToCamelCase,
    capitalize: capitalize,
    addIfMissing: addIfMissing
};
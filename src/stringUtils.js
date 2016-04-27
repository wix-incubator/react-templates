'use strict';
const _ = require('lodash');

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
 * @param {string} str
 * @return {string}
 */
function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

module.exports = {addIfMissing, capitalize};

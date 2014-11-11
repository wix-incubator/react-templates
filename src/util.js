'use strict';
var fs = require('fs');
var path = require('path');

/**
 * @param {string} source
 * @param {string} target
 * @return {boolean}
 */
function isStale(source, target) {
    if (!fs.existsSync(target)) {
        return true;
    }
    var sourceTime = fs.statSync(source).mtime;
    var targetTime = fs.statSync(target).mtime;
    return sourceTime.getTime() > targetTime.getTime();
}

module.exports = {
    isStale: isStale
};
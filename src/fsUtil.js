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

function createRelativeReadFileSync(baseFile) {
    var basePath = path.dirname(baseFile);
    return filename => fs.readFileSync(path.resolve(basePath, filename));
}

module.exports = {
    isStale: isStale,
    createRelativeReadFileSync: createRelativeReadFileSync
};

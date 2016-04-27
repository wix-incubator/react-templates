'use strict';
const fs = require('fs');
const path = require('path');

/**
 * @param {string} source
 * @param {string} target
 * @return {boolean}
 */
function isStale(source, target) {
    if (!fs.existsSync(target)) {
        return true;
    }
    const sourceTime = fs.statSync(source).mtime;
    const targetTime = fs.statSync(target).mtime;
    return sourceTime.getTime() > targetTime.getTime();
}

function createRelativeReadFileSync(baseFile) {
    const basePath = path.dirname(baseFile);
    return filename => fs.readFileSync(path.resolve(basePath, filename));
}

module.exports = {
    isStale: isStale,
    createRelativeReadFileSync: createRelativeReadFileSync
};

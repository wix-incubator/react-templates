'use strict';

var fs = require('fs');
var chalk = require('chalk');
var reactTemplates = require('./reactTemplates');
var convertTemplateToReact = reactTemplates.convertTemplateToReact;

/**
 * @param {string} source
 * @param {{commonJS:boolean}?} options
 * @param {string} target
 */
function convertFile(source, target, options) {
//    if (path.extname(filename) !== ".html") {
//        console.log('invalid file, only handle html files');
//        return;// only handle html files
//    }
    options = options || {};
    var fsUtil = require('./fsUtil');

    if (!options.force && !fsUtil.isStale(source, target)) {
        console.log('target file ' + chalk.cyan(target) + ' is up to date, skipping');
        return;
    }

    var html = fs.readFileSync(source).toString();
    if (!html.match(/\<\!doctype rt/i)) {
        throw new Error('invalid file, missing header');
    }
    var js = convertTemplateToReact(html, options);
    fs.writeFileSync(target, js);
}

module.exports = {
//    convertTemplateToReact: convertTemplateToReact,
    convertFile: convertFile,
    _test: {}
};
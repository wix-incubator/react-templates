'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var reactTemplates = require('./reactTemplates');
var convertTemplateToReact = reactTemplates.convertTemplateToReact;
var convertJSRTToJS = reactTemplates.convertJSRTToJS;

/**
 * @param {string} source
 * @param {string} target
 * @param {{modules:string, dryRun:boolean}?} options
 * @param {CONTEXT} context
 */
function convertFile(source, target, options, context) {
//    if (path.extname(filename) !== ".html") {
//        console.log('invalid file, only handle html files');
//        return;// only handle html files
//    }
    options = options || {};
    options.fileName = source;
    var fsUtil = require('./fsUtil');

    if (!options.force && !fsUtil.isStale(source, target)) {
        context.info('target file ' + chalk.cyan(target) + ' is up to date, skipping');
        return;
    }

    var html = fs.readFileSync(source).toString();
    var shouldAddName = options.modules === 'none' && !options.name;
    if (shouldAddName) {
        options.name = reactTemplates.normalizeName(path.basename(source, path.extname(source))) + 'RT';
    }
    var js;
    if (options.modules === 'jsrt') {
        js = convertJSRTToJS(html, options);
    } else {
        js = convertTemplateToReact(html, context, options);
    }
    if (!options.dryRun) {
        fs.writeFileSync(target, js);
    }
    if (shouldAddName) {
        delete options.name;
    }
}

module.exports = {
//    convertTemplateToReact: convertTemplateToReact,
    convertFile: convertFile,
    context: require('./context'),
    _test: {}
};

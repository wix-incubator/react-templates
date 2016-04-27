'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const reactTemplates = require('./reactTemplates');
const fsUtil = require('./fsUtil');
const convertRT = reactTemplates.convertRT;
const convertJSRTToJS = reactTemplates.convertJSRTToJS;

/**
 * @param {string} source
 * @param {string} target
 * @param {Options} options
 * @param {CONTEXT} context
 */
function convertFile(source, target, options, context) {
    options = options || {};
    options.fileName = source;

    if (!options.force && !fsUtil.isStale(source, target)) {
        context.verbose(`target file ${chalk.cyan(target)} is up to date, skipping`);
        return;
    }

    const html = fs.readFileSync(source).toString();
    if (path.extname(source) === '.rts') {
        const rtStyle = require('./rtStyle');
        const out = rtStyle.convert(html);
        if (!options.dryRun) {
            fs.writeFileSync(target, out);
        }
        return;
    }
    const shouldAddName = options.modules === 'none' && !options.name;
    if (shouldAddName) {
        options.name = reactTemplates.normalizeName(path.basename(source, path.extname(source))) + 'RT';
    }
    options.readFileSync = fsUtil.createRelativeReadFileSync(source);
    const js = options.modules === 'jsrt' ? convertJSRTToJS(html, context, options) : convertRT(html, context, options);
    if (!options.dryRun) {
        fs.writeFileSync(target, js);
    }
    if (shouldAddName) {
        delete options.name;
    }
}

module.exports = {
    convertFile: convertFile,
    context: require('./context'),
    _test: {}
};

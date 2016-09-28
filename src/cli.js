#!/usr/bin/env node
'use strict';
const _ = require('lodash');
const path = require('path');
const api = require('./api');
const context = require('./context');
const shell = require('./shell');
const pkg = require('../package.json');
const options = require('./options');
const reactDOMSupport = require('./reactDOMSupport');
const reactTemplates = require('./reactTemplates');
const rtStyle = require('./rtStyle');

/**
 * @param {Options} currentOptions
 * @return {number}
 */
function executeOptions(currentOptions) {
    let ret = 0;
    const files = currentOptions._;
    context.options.format = currentOptions.format || 'stylish';

    if (currentOptions.version) {
        console.log(`v${pkg.version}`);
    } else if (currentOptions.help) {
        if (files.length) {
            console.log(options.generateHelpForOption(files[0]));
        } else {
            console.log(options.generateHelp());
        }
    } else if (currentOptions.listTargetVersion) {
        printVersions(currentOptions);
    } else if (files.length) {
        _.forEach(files, handleSingleFile.bind(this, currentOptions));
        ret = shell.printResults(context);
    } else {
        console.log(options.generateHelp());
    }
    return ret;
}

function printVersions(currentOptions) {
    const ret = Object.keys(reactDOMSupport);
    if (currentOptions.format === 'json') {
        console.log(JSON.stringify(ret, undefined, 2));
    } else {
        console.log(ret.join(', '));
    }
}

/**
 * @param {Options} currentOptions
 * @param {string} filename file name to process
 */
function handleSingleFile(currentOptions, filename) {
    try {
        const sourceExt = path.extname(filename);
        let outputFilename;
        if (sourceExt === '.rt') {
            outputFilename = filename + (currentOptions.modules === 'typescript' ? '.ts' : '.js');
        } else if (sourceExt === '.jsrt') {
            outputFilename = filename.replace(/\.jsrt$/, '.js');
            currentOptions = _.assign({}, currentOptions, {modules: 'jsrt'});
        } else if (sourceExt === '.rts') {
            outputFilename = filename + '.js';
            currentOptions = _.assign({}, currentOptions, {modules: 'rts'});
        } else {
            context.error('invalid file, only handle rt/jsrt files', filename);
            return;
        }
        api.convertFile(filename, outputFilename, currentOptions, context);
    } catch (e) {
        context.error(e.message, filename, e.line, e.column, e.startOffset, e.endOffset);
    }
}

/**
 * Executes the CLI based on an array of arguments that is passed in.
 * @param {string|Array|Object} args The arguments to process.
 * @returns {int} The exit code for the operation.
 */
function execute(args) {
    try {
        const currentOptions = options.parse(args);
        console.log(JSON.stringify(currentOptions));

        return executeOptions(currentOptions);
    } catch (error) {
        console.error(error.message);
        return 1;
    }
}

module.exports = {
    context,
    execute,
    executeOptions,
    handleSingleFile,
    convertTemplateToReact: reactTemplates.convertTemplateToReact,
    convertStyle: rtStyle.convert
};

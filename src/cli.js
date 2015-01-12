#!/usr/bin/env node
/**
 * Created by idok on 11/10/14.
 */
'use strict';
//var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var api = require('./api');
var context = require('./context');
var shell = require('./shell');
var pkg = require('../package.json');
//var defaultOptions = {commonJS: false, force: false, json: false};
var options = require('./options');

function executeOptions(currentOptions) {
    var ret = 0;
    var files = currentOptions._;
    context.options.format = currentOptions.format || 'stylish';

    if (currentOptions.version) {
        console.log('v' + pkg.version);
    } else if (currentOptions.help) {
        if  (files.length) {
            console.log(options.generateHelpForOption(files[0]));
        } else {
            console.log(options.generateHelp());
        }
    } else if (!files.length) {
        console.log(options.generateHelp());
    } else {
        _.forEach(files, handleSingleFile.bind(this, currentOptions));
        ret = shell.printResults(context);
    }
    return ret;
}

/**
 * @param {*} currentOptions
 * @param {string} filename file name to process
 */
function handleSingleFile(currentOptions, filename) {
    if (path.extname(filename) !== '.rt') {
        context.error('invalid file, only handle rt files', filename);
        return;// only handle html files
    }
//    var html = fs.readFileSync(filename).toString();
//    if (!html.match(/\<\!doctype jsx/)) {
//        console.log('invalid file, missing header');
//        return;
//    }
//    var js = reactTemplates.convertTemplateToReact(html);
//    fs.writeFileSync(filename + '.js', js);
    try {
        api.convertFile(filename, filename + '.js', currentOptions, context);
    } catch (e) {
        context.error(e.message, filename, e.line || -1, -1, e.index || -1);
//        if (defaultOptions.json) {
//            context.error(e.message, filename, e.line || -1, -1, e.index || -1);
//            console.log(JSON.stringify(context.getMessages(), undefined, 2));
//        } else {
//            console.log('Error processing file: ' + filename + ', ' + e.message + ' line: ' + e.line || -1);
//        }
        // if (defaultOptions.stack)
        // console.log(e.stack);
    }
}

/**
 * Executes the CLI based on an array of arguments that is passed in.
 * @param {string|Array|Object} args The arguments to process.
 * @returns {int} The exit code for the operation.
 */
function execute(args) {
    var currentOptions;
    try {
        currentOptions = options.parse(args);
    } catch (error) {
        console.error(error.message);
        return 1;
    }
    //console.log(currentOptions);
    return executeOptions(currentOptions);
}

module.exports = {execute: execute, executeOptions: executeOptions, handleSingleFile: handleSingleFile};
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
var options = {commonJS: false, force: false, json: false};

//if (process.argv.length > 2) {
//    var files = [];
//    _.forEach(process.argv.slice(2),function (param) {
//        if (param === '-v' || param === '--version') {
//            console.log(pkg.version);
//        } else if (param === '-h' || param === '--help') {
//            printHelp();
//        } else if (param === '-c' || param === '--common') {
//            options.commonJS = true;
//        } else if (param === '-f' || param === '--force') {
//            options.force = true;
//        } else if (param === '-j' || param === '--json') { // TODO use optionator
//            context.options.format = 'json';
//        } else if (param !== '--no-color') {
//            files.push(param);
//        }
//    });
//    _.forEach(files, handleSingleFile);
//    shell.printResults(context);
//} else {
//    printHelp();
//}

function parseOptions(args) {
    var parsedOptions = {_: [], version: false, commonJS: false, force: false, format: 'stylish'};
    _.forEach(args, function (param) {
        if (param === '-v' || param === '--version') {
            parsedOptions.version = true;
        } else if (param === '-h' || param === '--help') {
            printHelp();
        } else if (param === '-c' || param === '--common') {
            parsedOptions.commonJS = true;
        } else if (param === '-f' || param === '--force') {
            parsedOptions.force = true;
        } else if (param === '-j' || param === '--json') { // TODO use optionator
            parsedOptions.format = 'json';
            context.options.format = 'json';
        } else if (param !== '--no-color') {
            parsedOptions._.push(param);
        }
    });
    return parsedOptions;
}

function executeOptions(currentOptions) {
    var ret = 0;
    if (currentOptions.help) {
        printHelp();
    } else if (currentOptions.version) {
        console.log(pkg.version);
    } else {
        _.forEach(currentOptions._, function (f) {
            handleSingleFile(f, currentOptions);
        });
        ret = shell.printResults(context);
    }
    return ret;
}

function printHelp() {
    console.log(pkg.name + ' ' + pkg.version);
    console.log(pkg.description);
    console.log('');
    console.log('Usage:');
    console.log('  $ rt <filename>[,<filename>] [<args>]');
    console.log('');
    console.log('Options:');
    console.log('  -v, --version        Outputs the version number.');
    console.log('  -h, --help           Show help.');
    console.log('  -j, --json           Report output format. [stylish,json]');
//    console.log('  -ft, --format        Report output format. [stylish,json]');
    console.log('  --common             Use Common JS output. default: false');
    console.log('  -f --force           Force creation of output. default: false');
}

function handleSingleFile(filename, currentOptions) {
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
//        if (options.json) {
//            context.error(e.message, filename, e.line || -1, -1, e.index || -1);
//            console.log(JSON.stringify(context.getMessages(), undefined, 2));
//        } else {
//            console.log('Error processing file: ' + filename + ', ' + e.message + ' line: ' + e.line || -1);
//        }
        // if (options.stack)
        // console.log(e.stack);
    }
}

/**
 * Executes the CLI based on an array of arguments that is passed in.
 * @param {string|Array|Object} args The arguments to process.
 * @returns {int} The exit code for the operation.
 */
function execute(args) {
    if (args.length > 2) {
        var opts = parseOptions(args.slice(2));
        return executeOptions(opts);
    }
    printHelp();
    return 0;
}

module.exports = {execute: execute, executeOptions: executeOptions};
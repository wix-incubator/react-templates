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

if (process.argv.length > 2) {
    var files = [];
    _.forEach(process.argv.slice(2),function (param) {
        if (param === '-v' || param === '--version') {
            console.log(pkg.version);
        } else if (param === '-h' || param === '--help') {
            printHelp();
        } else if (param === '-c' || param === '--common') {
            options.commonJS = true;
        } else if (param === '-f' || param === '--force') {
            options.force = true;
        } else if (param === '-j' || param === '--json') { // TODO use optionator
            context.options.format = 'json';
        } else {
            files.push(param);
        }
    });
    _.forEach(files, handleSingleFile);
} else {
    printHelp();
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
}

function handleSingleFile(filename) {
    if (path.extname(filename) !== '.rt') {
        console.log('invalid file, only handle rt files');
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
        api.convertFile(filename, filename + '.js', options);
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

    shell.printResults(context);
}
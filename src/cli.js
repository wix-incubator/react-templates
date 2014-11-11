#!/usr/bin/env node
/**
 * Created by idok on 11/10/14.
 */
'use strict';
//var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var reactTemplates = require('./reactTemplates');
var pkg = require('../package.json');

if (process.argv.length > 2) {
    if (process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--version') !== -1) {
        console.log(pkg.version);
    } else if (process.argv.indexOf('-h') !== -1 || process.argv.indexOf('--help') !== -1) {
        printHelp();
    } else {
        _.forEach(process.argv.slice(2), handleSingleFile);
    }
} else {
    printHelp();
}

function printHelp() {
    console.log(pkg.description);
    console.log('');
    console.log('Usage:');
    console.log('  $ node reactTemplates.js <filename>');
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
        reactTemplates.convertFile(filename, filename + '.js');
    } catch (e) {
        console.log('Error processing file: ' + filename + ', ' + e.description);
    }
}
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
var options = {commonJS: false};

if (process.argv.length > 2) {
    var files = [];
    _.forEach(process.argv.slice(2),function (param) {
        if (param === '-v' || param === '--version') {
            console.log(pkg.version);
        } else if (param === '-h' || param === '--help') {
            printHelp();
        } else if (param === '--common') {
            options.commonJS = true;
        } else {
            files.push(param);
        }
    });
    _.forEach(files,handleSingleFile);

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
        reactTemplates.convertFile(filename, filename + '.js', options);
    } catch (e) {
        console.log('Error processing file: ' + filename + ', ' + e.description);
    }
}
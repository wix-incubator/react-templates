/**
 * Created by idok on 11/10/14.
 */
'use strict';
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var reactTemplates = require('./reactTemplates');

if (process.argv.length > 2) {
    _.forEach(process.argv.slice(2), handleSingleFile);
} else {
    console.log("Usage:node reactTemplates.js <filename>");
}

function handleSingleFile(filename) {
    if (path.extname(filename) !== ".html") {
        console.log('invalid file, only handle html files');
        return;// only handle html files
    }
    var html = fs.readFileSync(filename).toString();
    if (!html.match(/\<\!doctype jsx/)) {
        console.log('invalid file, missing header');
        return;
    }
    var js = reactTemplates.convertTemplateToReact(html);
    fs.writeFileSync(filename.replace(".html", ".js"), js);
}
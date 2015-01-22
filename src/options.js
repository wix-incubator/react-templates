/**
 * @fileoverview Options configuration for optionator.
 * @author idok
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var optionator = require('optionator');
var pkg = require('../package.json');
var reactDOMSupport = require('./reactDOMSupport');

//------------------------------------------------------------------------------
// Initialization and Public Interface
//------------------------------------------------------------------------------

// exports 'parse(args)', 'generateHelp()', and 'generateHelpForOption(optionName)'
module.exports = optionator({
    prepend: [
        pkg.name + ' v' + pkg.version,
        pkg.description,
        '',
        'Usage:',
        '$ rt <filename> [<filename> ...] [<args>]'
    ].join('\n'),
    concatRepeatedArrays: true,
    mergeRepeatedObjects: true,
    options: [{
        heading: 'Options'
    }, {
        option: 'help',
        alias: 'h',
        type: 'Boolean',
        description: 'Show help.'
    }, {
        option: 'color',
        alias: 'c',
        default: 'true',
        type: 'Boolean',
        description: 'Use colors in output.'
    }, {
        option: 'modules',
        alias: 'm',
        default: 'none',
        type: 'String',
        description: 'Use output modules. (amd|commonjs|none)'
    }, {
        option: 'name',
        alias: 'n',
        type: 'String',
        description: 'When using globals, the name for the variable. The default is the [file name]RT'
    }, {
        option: 'dry-run',
        alias: 'd',
        default: 'false',
        type: 'Boolean',
        description: 'Run compilation without creating an output file, used to check if the file is valid'
    }, {
        option: 'force',
        alias: 'r',
        default: 'false',
        type: 'Boolean',
        description: 'Force creation of output. skip file check.'
    }, {
        option: 'format',
        alias: 'f',
        type: 'String',
        default: 'stylish',
        //enum: ['stylish', 'json'],
        description: 'Use a specific output format. (stylish|json)'
    }, {
        option: 'target-version',
        alias: 't',
        type: 'String',
        default: '0.12.2',
        description: 'React version to generate code for (' + Object.keys(reactDOMSupport).join(', ') + ')'
    }, {
        option: 'list-target-version',
        type: 'Boolean',
        default: 'false',
        description: 'Show list of target versions'
    }, {
        option: 'version',
        alias: 'v',
        type: 'Boolean',
        description: 'Outputs the version number.'
    }, {
        option: 'stack',
        alias: 'k',
        type: 'Boolean',
        description: 'Show stack trace on errors.'
    }]
});

/**
 * @fileoverview Options configuration for optionator.
 * @author idok
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const optionator = require('optionator');
const pkg = require('../package.json');
const reactDOMSupport = require('./reactDOMSupport');
const reactNativeSupport = require('./reactNativeSupport');

//------------------------------------------------------------------------------
// Initialization and Public Interface
//------------------------------------------------------------------------------

// exports 'parse(args)', 'generateHelp()', and 'generateHelpForOption(optionName)'
module.exports = optionator({
    prepend:
`${pkg.name}  v${pkg.version}
${pkg.description}

Usage:
$ rt <filename> [<filename> ...] [<args>]`,
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
        type: 'String',
        enum: ['amd', 'commonjs', 'none', 'es6', 'typescript', 'jsrt'],
        description: 'Use output modules. (amd|commonjs|none|es6|typescript|jsrt)'
    }, {
        option: 'name',
        alias: 'n',
        type: 'String',
        description: 'When using globals, the name for the variable. The default is the [file name]RT, when using amd, the name of the module'
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
        default: reactDOMSupport.default,
        description: `'React version to generate code for (${Object.keys(reactDOMSupport).join(', ')})'`
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
    }, {
        option: 'react-import-path',
        type: 'String',
        description: 'Dependency path for importing React.'
    }, {
        option: 'lodash-import-path',
        default: 'lodash',
        type: 'String',
        description: 'Dependency path for importing lodash.'
    }, {
        option: 'native',
        alias: 'rn',
        type: 'Boolean',
        description: 'Renders react native templates.'
    }, {
        option: 'flow',
        type: 'Boolean',
        description: 'Add /* @flow */ to the top of the generated file'
    }, {
        option: 'native-target-version',
        alias: 'rnv',
        type: 'String',
        default: reactNativeSupport.default,
        description: `'React native version to generate code for (${Object.keys(reactNativeSupport).join(', ')})'`
    }]
});

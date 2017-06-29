/*eslint object-shorthand:0*/
'use strict'
// const path = require('path')

module.exports = function (/*wallaby*/) {
    return {
        files: [
            'src/**/*.js'
            // {pattern: 'lib/data/*.*', instrument: false},
            // 'lib/formatters/*.js',
            // {pattern: 'test/testData/**/*.*', instrument: false},
            // {pattern: 'test/src/utils/*.js', instrument: false}
        ],
        tests: [
            'test/**/*.unit.js'
        ],
        testFramework: 'mocha',
        // debug: true,
        // reportConsoleErrorAsError: true,
        // maxConsoleMessagesPerTest: 10000,
        env: {
            // use 'node' type to use node.js or io.js
            type: 'node',
            // if runner property is not set, then wallaby.js embedded node/io.js version is used
            // you can specifically set the node version by specifying 'node' (or any other command)
            // that resolves your default node version or just specify the path
            // your node installation, like
            runner: process.env.NODE_HOME
            // runner: '/Users/idok/.nvm/versions/node/v6.9.4/bin/node'
            //runner: '/usr/local/bin/jasmine-node'
            // or
            // runner: 'path to the desired node version'
//            params: {
//                runner: '--harmony --harmony_arrow_functions',
//                env: 'PARAM1=true;PARAM2=false'
//            }
        },
        setup: function (w) {
            // require(path.resolve(__dirname, './spec/support/unit-init.js'))
            // require('jasmine-expect')
            // w.testFramework.addMatchers(require('./test/src/utils/customMatchers'))
            w.testFramework.DEFAULT_TIMEOUT_INTERVAL = 2500
        }
    }
}

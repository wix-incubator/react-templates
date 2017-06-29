#!/usr/bin/env node
'use strict'
const cli = require('../dist/cli') //src
// console.log(process.argv);
const exitCode = cli.execute(process.argv)
/*eslint no-process-exit:0*/
process.exit(exitCode)

#!/usr/bin/env node
'use strict';
var cli = require('../src/cli');
var exitCode = cli.execute(process.argv);
/*eslint no-process-exit:0*/
process.exit(exitCode);
#!/usr/bin/env node
'use strict';
var cli = require('../dist/cli');
var exitCode = cli.execute(process.argv);
/*eslint no-process-exit:0*/
process.exit(exitCode);

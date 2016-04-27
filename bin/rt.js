#!/usr/bin/env node
'use strict';
const cli = require('../dist/cli');
const exitCode = cli.execute(process.argv);
/*eslint no-process-exit:0*/
process.exit(exitCode);

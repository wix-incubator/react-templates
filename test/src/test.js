'use strict';
const test = require('tape');
const path = require('path');
const dataPath = path.resolve(__dirname, '..', 'data');

const specs = ['rt.invalid', 'rt.valid', 'utils', 'shell', 'rtStyle', 'fsUtil'];

specs
    .map(file => require(`./${file}.spec`))
    .forEach(spec => spec.runTests(test, dataPath));

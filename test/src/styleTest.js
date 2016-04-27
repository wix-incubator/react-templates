'use strict';
const test = require('tape');
const rtStyle = require('../../src/rtStyle');
const text = '.text { background-color: #00346E; padding: 3px; }';
const textEp = '{\n  "text": {\n    "backgroundColor": "#00346E",\n    "padding": 3\n  }\n}';

test('html tests', t => {
    const res = rtStyle.convertBody(text);
    t.equal(res, textEp);
    t.end();
});

'use strict';
var test = require('tape');
var rtStyle = require('../../src/rtStyle');
var text = '.text { background-color: #00346E; padding: 3px; }';
var textEp = '{\n  "text": {\n    "backgroundColor": "#00346E",\n    "padding": 3\n  }\n}';

test('html tests', function (t) {
    var res = rtStyle.convertBody(text);
    t.equal(res, textEp);
    t.end();
});

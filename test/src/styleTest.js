'use strict';
var test = require('tape');
var rtStyle = require('../../src/rtStyle');
//var fs = require('fs');
//var _ = require('lodash');
//var path = require('path');
//var React = require('react/addons');
//var util = require('./util');
//var dataPath = path.resolve(__dirname, '..', 'data');


var text = '.text { background-color: #00346E; padding: 3px; }';
//var textEp = "{text: {backgroundColor: '#00346E', padding: 3px}}";
//var textEp = '{"text":{"backgroundColor":"#00346E","padding":3}}';
var textEp = '{\n  "text": {\n    "backgroundColor": "#00346E",\n    "padding": 3\n  }\n}';
//var textEpModule = '\'use strict\';\nvar style = {"text":{"backgroundColor":"#00346E","padding":3}};\nmodule.exports = style;\n';
//var row = '.text { background-color: #00346E; padding: 3px; }';

test('html tests', function (t) {
    var res = rtStyle.convertBody(text);
    t.equal(res, textEp);
    t.end();
});

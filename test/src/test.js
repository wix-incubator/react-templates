'use strict';
var test = require('tape');
var reactTemplates = require('../../src/reactTemplates');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');

var dataPath = path.resolve(__dirname, '..', 'data');

test('timing test', function (t) {
    t.plan(1);

    var filename = path.join(dataPath, 'test.html');
    var html = fs.readFileSync(filename).toString();
    var expected = fs.readFileSync(filename.replace(".html", ".js")).toString();
    var actual = reactTemplates.convertTemplateToReact(html);
    t.equal(actual, expected);
});
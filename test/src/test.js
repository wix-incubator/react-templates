'use strict';
var test = require('tape');
var reactTemplates = require('../../src/reactTemplates');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var React = require('react');

var dataPath = path.resolve(__dirname, '..', 'data');

test('conversion test', function (t) {
    var files = ['div.rt', 'test.rt', 'repeat.rt'];
    t.plan(files.length);

    files.forEach(check);

    function check(testFile) {
        var filename = path.join(dataPath, testFile);
        var html = fs.readFileSync(filename).toString();
        var expected = fs.readFileSync(filename + '.js').toString().replace(/\r/g,"");
//        var expected = fs.readFileSync(filename.replace(".html", ".js")).toString();
        var actual = reactTemplates.convertTemplateToReact(html).replace(/\r/g,"");
        t.equal(actual, expected);
        if (actual !== expected) {
            fs.writeFileSync(filename + '.actual.js', actual);
        }
    }
});

test('html tests', function (t) {
    var files = ['scope.rt'];
    t.plan(files.length);

    files.forEach(check);

    function check(testFile) {
        var filename = path.join(dataPath, testFile);
        var html = fs.readFileSync(filename).toString();
        var expected = fs.readFileSync(filename + '.html').toString().replace(/\r/g,"");
//        var expected = fs.readFileSync(filename.replace(".html", ".js")).toString();
        var code = reactTemplates.convertTemplateToReact(html).replace(/\r/g,"");
        var defineMap = {"react":React,"lodash":_};
        var define = function (requirementsNames,content) {
            var requirements = _.map(requirementsNames,function (reqName) {
                return defineMap[reqName];
            });
            return content.apply(this,requirements);
        };
        var comp = React.createFactory(React.createClass({
            render: eval(code)
        }));
        var actual = React.renderToStaticMarkup(comp());
        console.log(actual);
        t.equal(actual, expected);
        if (actual !== expected) {
            fs.writeFileSync(filename + '.actual.html', actual);
        }
    }

});


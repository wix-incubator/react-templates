'use strict';
var examplesTemplate = require('./examples.rt.js');
var React = require('react/addons');
var _ = require('lodash');
var fs = require('fs');

var helloCode = fs.readFileSync(__dirname + '/samples/hello.code').toString();
var helloRT = fs.readFileSync(__dirname + '/samples/hello.rt').toString();
var todoCode = fs.readFileSync(__dirname + '/samples/todo.code').toString();
var todoRT = fs.readFileSync(__dirname + '/samples/todo.rt').toString();

var samples = [
    [helloCode, helloRT],
    [todoCode, todoRT]
];
samples = _.map(samples, function (tuple) {
    return {templateProps: tuple[0], templateHTML: tuple[1]};
});

var Examples = React.createClass({
    displayName: 'Examples',
    mixins: [React.addons.LinkedStateMixin],

    getInitialState: function () {
        return {
            samples: samples
        };
    },

    render: function () {
        return examplesTemplate.apply(this);
    }
});

module.exports = Examples;
/**
 * Created by avim on 12/2/2014.
 */
var React = require('react/addons');
var _ = require('lodash');
var introTemplate = require('./intro.rt.js');
var path = require('path');
var fs = require('fs');

var helloCode = fs.readFileSync(__dirname+"/samples/hello.code").toString();
var helloRT = fs.readFileSync(__dirname+"/samples/hello.rt").toString();
var todoCode = fs.readFileSync(__dirname+"/samples/todo.code").toString();
var todoRT = fs.readFileSync(__dirname+"/samples/todo.rt").toString();
var samples = [
    [helloCode,helloRT],
    [todoCode,todoRT]
];
samples = _.map(samples,function (tuple) {
    return {templateProps:tuple[0],templateHTML:tuple[1]}
});


var intro = React.createClass({
    displayName:"Intro",
    getInitialState: function (){
        return {
            samples:samples
        }
    },
    render: function () {
        return introTemplate.apply(this);
    }
});

module.exports = intro;

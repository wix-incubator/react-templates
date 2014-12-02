'use strict';
/*eslint-env browser*/
var reactTemplates = require('../src/reactTemplates');

var React = require('react/addons');

var _ = require('lodash');

var html = '<div>hello</div>';
var res = reactTemplates.convertTemplateToReact(html.trim());
//console.log(res);

var Playground = require('./playground.js');
window.playground = React.render(Playground({"direction":'vertical'}), document.getElementById('playground'));

/*
function generateRandomId() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = _.random(0,15);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};


if (window.location.hash) {
    var firebase = new Firebase('https://co5qowu8b6k.firebaseio-demo.com/'+window.location.hash);
    firebase.on('value',function (snapshot) {
        window.playground.setState(snapshot.val());
        firebase.goOffline();
    });
}*/




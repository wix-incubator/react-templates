var React = require('react/addons');
var _ = require('lodash');
var playground = require('./playground.js');
'use strict';
function onClick1(evt) {
    evt.preventDefault();
    this.save();
}
module.exports = function () {
    return React.DOM.div({}, React.DOM.div({ 'id': 'header' }, React.DOM.div({ 'id': 'header-title' }, React.DOM.img({
        'className': 'nav-logo',
        'src': 'https://facebook.github.io/react/img/logo.svg',
        'width': '36',
        'height': '36'
    }), '\n            RTFIddle\n        '), React.DOM.div({
        'style': {
            paddingLeft: '20px',
            display: 'inline-block'
        }
    }, React.DOM.button({
        'className': 'btn',
        'onClick': onClick1.bind(this)
    }, 'Save fiddle'))), React.DOM.div({}    /* <h1>React Templates fiddle</h1> */
          /* <h2>Play with react templates and save/share your results</h2> */
          /* <button class="btn btn-lg btn-primary" onClick="(evt)=>evt.preventDefault();this.save()">Save fiddle</button> */
          /* <br /> */, playground({
        'ref': 'playground',
        'direction': 'vertical',
        'fiddle': true
    })));
};
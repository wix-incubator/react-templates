/*eslint new-cap:0,no-unused-vars:0*/
define([
    'react/addons',
    'lodash',
    './playground'
], function (React, _, playground) {
    'use strict';
    function onClick1(evt) {
        evt.preventDefault();
        this.save();
    }
    return function () {
        return React.createElement('div', { 'className': 'fiddle' }, React.createElement('div', { 'id': 'header' }, React.createElement('div', { 'id': 'header-title' }, React.createElement('img', {
            'className': 'nav-logo',
            'src': 'https://facebook.github.io/react/img/logo.svg',
            'width': '36',
            'height': '36'
        }), '\n            RTFiddle\n        '), React.createElement('div', { 'id': 'buttons-bar' }, React.createElement('button', {
            'className': 'btn',
            'onClick': onClick1.bind(this)
        }, 'Save fiddle')))    /* <div> */
                               /* <h1>React Templates fiddle</h1> */
                               /* <h2>Play with react templates and save/share your results</h2> */
                               /* <button class="btn btn-lg btn-primary" onClick="(evt)=>evt.preventDefault();this.save()">Save fiddle</button> */
                               /* <br /> */, React.createElement(playground, {
            'ref': 'playground',
            'direction': 'vertical',
            'fiddle': true
        })    /* </div> */);
    };
});
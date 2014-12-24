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
    function onClick2(evt) {
        evt.preventDefault();
        this.clear();
    }
    function onClick3(evt) {
        evt.preventDefault();
        this.loadSample('rt-if');
    }
    function onClick4(evt) {
        evt.preventDefault();
        this.loadSample('rt-repeat');
    }
    function onClick5(evt) {
        evt.preventDefault();
        this.loadSample('rt-props');
    }
    function onClick6(evt) {
        evt.preventDefault();
        this.loadSample('todo');
    }
    function onClick7(evt) {
        evt.preventDefault();
        this.loadSample('weather');
    }
    return function () {
        return React.createElement('div', { 'className': 'fiddle' }, React.createElement('div', { 'id': 'header' }, React.createElement('div', { 'id': 'header-title' }, React.createElement('a', {
            'href': 'index.html',
            'className': 'title-link'
        }, React.createElement('img', {
            'className': 'nav-logo',
            'src': 'https://wix.github.io/react-templates/img/logo-rt.svg',
            'width': '56',
            'height': '24'
        })), '\n            RTFiddle\n        '), React.createElement('div', { 'id': 'buttons-bar' }, React.createElement('button', {
            'type': 'button',
            'className': 'btn btn-default',
            'onClick': onClick1.bind(this)
        }, React.createElement('span', {
            'className': 'glyphicon glyphicon-star button-icon',
            'aria-hidden': 'true'
        }), 'Save fiddle\n            '), React.createElement('button', {
            'type': 'button',
            'className': 'btn btn-default',
            'onClick': onClick2.bind(this)
        }, React.createElement('span', {
            'className': 'glyphicon glyphicon-trash button-icon',
            'aria-hidden': 'true'
        }), 'Clear\n            '), React.createElement('div', { 'className': 'dropdown toolbar-dropdown' }, React.createElement('button', {
            'className': 'btn btn-default dropdown-toggle',
            'type': 'button',
            'id': 'dropdownMenu1',
            'data-toggle': 'dropdown',
            'aria-expanded': 'true'
        }, '\n                    Load Sample\n                    ', React.createElement('span', { 'className': 'caret' })), React.createElement('ul', {
            'className': 'dropdown-menu',
            'role': 'menu',
            'aria-labelledby': 'dropdownMenu1'
        }, React.createElement('li', { 'role': 'presentation' }, React.createElement('a', {
            'role': 'menuitem',
            'tabIndex': '-1',
            'href': '#',
            'onClick': onClick3.bind(this)
        }, 'rt-if')), React.createElement('li', { 'role': 'presentation' }, React.createElement('a', {
            'role': 'menuitem',
            'tabIndex': '-1',
            'href': '#',
            'onClick': onClick4.bind(this)
        }, 'rt-repeat')), React.createElement('li', { 'role': 'presentation' }, React.createElement('a', {
            'role': 'menuitem',
            'tabIndex': '-1',
            'href': '#',
            'onClick': onClick5.bind(this)
        }, 'rt-props')), React.createElement('li', { 'role': 'presentation' }, React.createElement('a', {
            'role': 'menuitem',
            'tabIndex': '-1',
            'href': '#',
            'onClick': onClick6.bind(this)
        }, 'Todo')), React.createElement('li', { 'role': 'presentation' }, React.createElement('a', {
            'role': 'menuitem',
            'tabIndex': '-1',
            'href': '#',
            'onClick': onClick7.bind(this)
        }, 'Weather'))))))    /* <div> */
                              /* <h1>React Templates fiddle</h1> */
                              /* <h2>Play with react templates and save/share your results</h2> */
                              /* <button class="btn btn-lg btn-primary" onClick="(evt)=>evt.preventDefault();this.save()">Save fiddle</button> */
                              /* <br /> */, React.createElement('div', { 'className': 'playground-container' }, React.createElement(playground, {
            'ref': 'playground',
            'direction': 'vertical',
            'fiddle': true
        }))    /* </div> */);
    };
});
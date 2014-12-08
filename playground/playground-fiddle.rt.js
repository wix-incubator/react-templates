/*eslint new-cap:0,no-unused-vars:0*/
define([
    'react/addons',
    'lodash',
    './aceEditor'
], function (React, _, CodeEditor) {
    'use strict';
    function onChange1(evt) {
        this.setState({ 'templateHTML': evt.target.value });
    }
    function onChange2(evt) {
        this.setState({ 'templateProps': evt.target.value });
    }
    function onSubmit3(e) {
        e.preventDefault();
    }
    return function () {
        return React.createElement('div', { 'className': 'playground' }, React.createElement('div', { 'className': 'fiddle-row' }, React.createElement('div', { 'className': 'code-area' }, React.createElement(CodeEditor, {
            'id': 'editor-rt',
            'className': 'large-text-area',
            'style': { border: this.validHTML ? '1px solid black' : '2px solid red' },
            'value': this.state.templateHTML,
            'mode': 'html',
            'onChange': onChange1.bind(this)
        })), React.createElement('div', { 'className': 'code-area' }, React.createElement(CodeEditor, {
            'id': 'editor-code',
            'className': 'large-text-area',
            'style': { border: this.validProps ? '1px solid black' : '2px solid red' },
            'value': this.state.templateProps,
            'mode': 'javascript',
            'onChange': onChange2.bind(this)
        }))), React.createElement('div', { 'className': 'fiddle-row' }, React.createElement('div', { 'className': 'code-area' }, React.createElement(CodeEditor, {
            'id': 'editor-generated',
            'className': 'large-text-area',
            'style': { border: '1px solid black' },
            'value': this.templateSource,
            'mode': 'javascript',
            'readOnly': true
        })), React.createElement('div', { 'className': 'result-area' }, React.createElement('div', {
            'id': 'result-area',
            'key': 'result-area',
            'className': 'well'
        }, React.createElement('h2', {}, 'Preview:'), React.createElement('form', {
            'className': 'sample-view',
            'onSubmit': onSubmit3.bind(this)
        }, React.createElement(this.sample, { 'key': 'sample' })))))    /* <br style="clear:both"> */);
    };
});
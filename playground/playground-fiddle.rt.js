var React = require('react/addons');
var _ = require('lodash');
var CodeEditor = require('./aceEditor');
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
module.exports = function () {
    return React.DOM.div({ 'className': 'playground' }, React.DOM.div({ 'className': 'code-area' }, CodeEditor({
        'className': 'large-text-area',
        'style': { border: this.validHTML ? '1px solid black' : '2px solid red' },
        'value': this.state.templateHTML,
        'mode': 'html',
        'onChange': onChange1.bind(this)
    })), React.DOM.div({ 'className': 'code-area' }, CodeEditor({
        'className': 'large-text-area',
        'style': { border: this.validProps ? '1px solid black' : '2px solid red' },
        'value': this.state.templateProps,
        'mode': 'javascript',
        'onChange': onChange2.bind(this)
    })), React.DOM.div({ 'className': 'code-area' }, CodeEditor({
        'className': 'large-text-area',
        'style': { border: '1px solid black' },
        'value': this.templateSource,
        'mode': 'javascript',
        'readOnly': true
    })), React.DOM.div({
        'key': 'result-area',
        'className': 'result-area'
    }, React.DOM.h2({}, 'Preview:'), React.DOM.form({
        'className': 'sample-view',
        'onSubmit': onSubmit3.bind(this)
    }, this.sample({ 'key': 'sample' }))), React.DOM.br({ 'style': { clear: 'both' } }));
};
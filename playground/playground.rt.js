var React = require('react');
var _ = require('lodash');
var CodeEditor = require('react-code-mirror');
'use strict';
function onChange1(evt) {
    this.setState({ 'templateHTML': evt.target.value });
}
function onChange2(evt) {
    this.setState({ 'templateProps': evt.target.value });
}
module.exports = function () {
    return React.DOM.div({}, React.DOM.div({ 'className': 'code-area' }, React.DOM.h2({}, 'Template:'), CodeEditor({
        'className': 'large-text-area',
        'style': { border: this.validHTML ? '1px solid black' : '2px solid red' },
        'value': this.state.templateHTML,
        'mode': 'htmlmixed',
        'smartIndent': true,
        'lineNumbers': true,
        'onChange': onChange1.bind(this)
    }), React.DOM.br({}), React.DOM.h2({}, 'Class:'), CodeEditor({
        'className': 'large-text-area',
        'style': { border: this.validProps ? '1px solid black' : '2px solid red' },
        'value': this.state.templateProps,
        'mode': 'javascript',
        'theme': 'solarized',
        'smartIndent': true,
        'lineNumbers': true,
        'onChange': onChange2.bind(this)
    })), React.DOM.div({
        'key': 'result-area',
        'className': 'result-area'
    }, React.DOM.h2({}, 'Generated code:'), CodeEditor({
        'className': 'large-text-area',
        'style': { border: '1px solid black' },
        'value': this.templateSource,
        'mode': 'javascript',
        'theme': 'solarized',
        'smartIndent': true,
        'lineNumbers': true,
        'readOnly': true
    }), React.DOM.br({}), React.DOM.h2({}, 'Preview:'), React.DOM.div({ 'className': 'sample-view' }, this.sample({ 'key': 'sample' }))));
};
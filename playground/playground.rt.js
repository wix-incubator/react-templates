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
    return React.DOM.div({}, React.DOM.div({ 'className': 'code-area' }, React.DOM.form({}, CodeEditor({
        'className': 'large-text-area',
        'style': { border: this.validHTML ? '1px solid black' : '2px solid red' },
        'value': this.state.templateHTML,
        'mode': 'htmlmixed',
        'smartIndent': true,
        'lineNumbers': true,
        'onChange': onChange1.bind(this)
    }), React.DOM.br({}), CodeEditor({
        'className': 'large-text-area',
        'style': { border: this.validProps ? '1px solid black' : '2px solid red' },
        'value': this.state.templateProps,
        'mode': 'javascript',
        'theme': 'solarized',
        'smartIndent': true,
        'lineNumbers': true,
        'onChange': onChange2.bind(this)
    }))), React.DOM.div({ 'className': 'result-area' }, this.sample({})));
};
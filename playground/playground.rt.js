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
    return React.DOM.div({}, React.DOM.div({
        'id': 'myTab',
        'role': 'tabpanel',
        'className': 'code-area ' + (this.props.direction === 'horizontal' && 'horizontal' || 'vertical')
    }    /*  Nav tabs  */, React.DOM.ul({
        'className': 'nav nav-pills',
        'role': 'tablist'
    }, React.DOM.li({
        'role': 'presentation',
        'className': 'active'
    }, React.DOM.a({
        'href': '#template',
        'aria-controls': 'template',
        'role': 'tab',
        'data-toggle': 'tab'
    }, 'Template')), React.DOM.li({ 'role': 'presentation' }, React.DOM.a({
        'href': '#classCode',
        'aria-controls': 'classCode',
        'role': 'tab',
        'data-toggle': 'tab'
    }, 'Class')), React.DOM.li({ 'role': 'presentation' }, React.DOM.a({
        'href': '#generatedCode',
        'aria-controls': 'generatedCode',
        'role': 'tab',
        'data-toggle': 'tab'
    }, 'Generated code')))    /*  Tab panes  */, React.DOM.div({ 'className': 'tab-content' }, React.DOM.div({
        'role': 'tabpanel',
        'className': 'tab-pane active',
        'id': 'template'
    }, CodeEditor({
        'className': 'large-text-area',
        'style': { border: this.validHTML ? '1px solid black' : '2px solid red' },
        'value': this.state.templateHTML,
        'mode': 'html',
        'onChange': onChange1.bind(this)
    })), React.DOM.div({
        'role': 'tabpanel',
        'className': 'tab-pane',
        'id': 'classCode'
    }, CodeEditor({
        'className': 'large-text-area',
        'style': { border: this.validProps ? '1px solid black' : '2px solid red' },
        'value': this.state.templateProps,
        'mode': 'javascript',
        'onChange': onChange2.bind(this)
    })), React.DOM.div({
        'role': 'tabpanel',
        'className': 'tab-pane',
        'id': 'generatedCode'
    }, CodeEditor({
        'className': 'large-text-area',
        'style': { border: '1px solid black' },
        'value': this.templateSource,
        'mode': 'javascript',
        'readOnly': true
    })))), React.DOM.div({
        'key': 'result-area',
        'className': 'result-area well ' + (this.props.direction === 'horizontal' && 'horizontal' || 'vertical'),
        'style': { marginTop: '48px' }
    }, React.DOM.h2({}, 'Preview:'), React.DOM.form({
        'className': 'sample-view',
        'onSubmit': onSubmit3.bind(this)
    }, this.sample({ 'key': 'sample' }))), React.DOM.br({ 'style': { clear: 'both' } }));
};
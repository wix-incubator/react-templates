/*eslint new-cap:0,no-unused-vars:0*/
define([
    'react/addons',
    'lodash',
    './CodeMirrorEditor'
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
        return React.createElement('div', { 'className': 'playground' }, React.createElement('div', {
            'id': this.props.id + '-myTab',
            'role': 'tabpanel',
            'className': 'code-area ' + (this.props.direction === 'horizontal' && 'horizontal' || 'vertical')
        }    /*  Nav tabs  */, React.createElement('ul', {
            'className': 'nav nav-tabs',
            'role': 'tablist'
        }, React.createElement('li', {
            'role': 'presentation',
            'className': 'active'
        }, React.createElement('a', {
            'href': '#' + this.props.id + '-template',
            'aria-controls': 'template',
            'role': 'tab',
            'data-toggle': 'tab'
        }, 'Template')), this.props.codeVisible ? React.createElement('li', { 'role': 'presentation' }, React.createElement('a', {
            'href': '#' + this.props.id + '-classCode',
            'aria-controls': 'classCode',
            'role': 'tab',
            'data-toggle': 'tab'
        }, 'Class')) : null, React.createElement('li', { 'role': 'presentation' }, React.createElement('a', {
            'href': '#' + this.props.id + '-generatedCode',
            'aria-controls': 'generatedCode',
            'role': 'tab',
            'data-toggle': 'tab'
        }, 'Generated code')))    /*  Tab panes  */, React.createElement('div', { 'className': 'tab-content' }, React.createElement('div', {
            'role': 'tabpanel',
            'className': 'tab-pane active',
            'id': this.props.id + '-template'
        }, React.createElement(CodeEditor, {
            'ref': 'editorRT',
            'className': 'large-text-area',
            'style': { border: this.validHTML ? '' : '2px solid red' },
            'value': this.state.templateHTML,
            'mode': 'html',
            'onChange': onChange1.bind(this)
        })), this.props.codeVisible ? React.createElement('div', {
            'role': 'tabpanel',
            'className': 'tab-pane',
            'id': this.props.id + '-classCode'
        }, React.createElement(CodeEditor, {
            'ref': 'editorCode',
            'className': 'large-text-area',
            'style': { border: this.validProps ? '' : '2px solid red' },
            'value': this.state.templateProps,
            'mode': 'javascript',
            'onChange': onChange2.bind(this)
        })) : null, React.createElement('div', {
            'role': 'tabpanel',
            'className': 'tab-pane',
            'id': this.props.id + '-generatedCode'
        }, React.createElement(CodeEditor, {
            'className': 'large-text-area',
            'value': this.templateSource,
            'mode': 'javascript',
            'readOnly': true
        })))), React.createElement('div', {
            'key': 'result-area',
            'className': 'result-area  ' + (this.props.direction === 'horizontal' && 'horizontal' || 'vertical')
        }, React.createElement('span', { 'className': 'preview-title' }, '\xA0'), React.createElement('form', {
            'className': 'sample-view',
            'onSubmit': onSubmit3.bind(this)
        }, React.createElement(this.sample, { 'key': 'sample' }))), React.createElement('br', { 'style': { clear: 'both' } }));
    };
});
define([
    'react/addons',
    'lodash',
    './CodeMirrorEditor'
], function (React, _, CodeEditor) {
    'use strict';
    function onChange1(e) {
        this.setState({ templateHTML: e.target.value });
    }
    function onChange2(e) {
        this.setState({ templateProps: e.target.value });
    }
    function onSubmit3(e) {
        e.preventDefault();
    }
    return function () {
        return React.createElement('div', { 'className': 'playground' }, React.createElement('div', { 'className': 'fiddle-row' }, React.createElement('div', {
            'className': 'code-area',
            'id': 'area-rt'
        }, React.createElement(CodeEditor, {
            'ref': 'editorRT',
            'id': 'editor-rt',
            'className': 'large-text-area',
            'value': this.state.templateHTML,
            'mode': 'html',
            'onChange': onChange1.bind(this)
        })), React.createElement('div', {
            'className': 'code-area',
            'id': 'area-code'
        }, React.createElement(CodeEditor, {
            'ref': 'editorCode',
            'id': 'editor-code',
            'className': 'large-text-area',
            'value': this.state.templateProps,
            'mode': 'javascript',
            'onChange': onChange2.bind(this)
        }))), React.createElement('div', { 'className': 'fiddle-row' }, React.createElement('div', {
            'className': 'code-area',
            'id': 'area-generated'
        }, React.createElement(CodeEditor, {
            'id': 'editor-generated',
            'className': 'large-text-area',
            'ref': 'editorGenerated',
            'value': this.templateSource,
            'mode': 'javascript',
            'readOnly': true
        })), React.createElement('div', {
            'className': 'code-area',
            'id': 'area-result'
        }    /* <div id="result-container" class="result-area"> */, React.createElement('div', {
            'id': 'result-area',
            'key': 'result-area',
            'className': 'sample-view'
        }, React.createElement('form', {
            'className': 'result-area-form',
            'ref': 'mount',
            'onSubmit': onSubmit3.bind(this)
        }    /* <this.sample key="sample"> */
             /* </this.sample> */)))));
    };
});
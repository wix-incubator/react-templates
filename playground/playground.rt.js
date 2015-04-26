define([
    'react/addons',
    'lodash',
    './CodeMirrorEditor'
], function (React, _, CodeEditor) {
    'use strict';
    function onClick1(tab, tabIndex, evt) {
        evt.preventDefault();
        this.setState({ 'currentTab': tab[0] });
    }
    function repeatTab2(tab, tabIndex) {
        return React.createElement('li', {
            'role': 'presentation',
            'className': _.keys(_.pick({ active: this.state.currentTab === tab[0] }, _.identity)).join(' '),
            'onClick': onClick1.bind(this, tab, tabIndex)
        }, React.createElement('a', { 'aria-controls': tab[1] }, tab[1]));
    }
    function onChange3(evt) {
        this.setState({ templateHTML: evt.target.value });
    }
    function onChange4(evt) {
        this.setState({ templateProps: evt.target.value });
    }
    function onSubmit5(e) {
        e.preventDefault();
    }
    return function () {
        return React.createElement('div', { 'className': 'playground' }, React.createElement('div', {
            'id': this.props.id + '-myTab',
            'className': 'code-area ' + this.getLayoutClass()
        }    /*  Nav tabs  */, React.createElement.apply(this, [
            'ul',
            {
                'className': 'nav nav-tabs',
                'role': 'tablist'
            },
            _.map(this.getTabs(), repeatTab2.bind(this))
        ])    /*  Tab panes  */, React.createElement('div', {}, this.state.currentTab === 'templateHTML' ? React.createElement('div', {
            'key': 'editorRT',
            'className': 'tab-pane active'
        }, React.createElement(CodeEditor, {
            'ref': 'editorRT',
            'className': 'large-text-area',
            'style': { border: this.validHTML ? '' : '2px solid red' },
            'value': this.state.templateHTML,
            'mode': 'html',
            'onChange': onChange3.bind(this)
        })) : null, this.state.currentTab === 'templateProps' ? React.createElement('div', {
            'key': 'editorCode',
            'className': 'tab-pane active'
        }, React.createElement(CodeEditor, {
            'ref': 'editorCode',
            'className': 'large-text-area',
            'style': { border: this.validProps ? '' : '2px solid red' },
            'value': this.state.templateProps,
            'mode': 'javascript',
            'onChange': onChange4.bind(this)
        })) : null, this.state.currentTab === 'templateSource' ? React.createElement('div', {
            'key': 'templateSource',
            'className': 'tab-pane active'
        }, React.createElement(CodeEditor, {
            'className': 'large-text-area',
            'value': this.templateSource,
            'mode': 'javascript',
            'readOnly': true
        })) : null)), React.createElement('div', {
            'key': 'result-area',
            'className': 'result-area ' + this.getLayoutClass()
        }, React.createElement('span', { 'className': 'preview-title' }, '\xA0'), React.createElement('form', {
            'ref': 'mount',
            'className': 'sample-view',
            'onSubmit': onSubmit5.bind(this)
        }    /* <this.sample key="sample"> */
             /* </this.sample> */)), React.createElement('br', { 'style': { clear: 'both' } }));
    };
});
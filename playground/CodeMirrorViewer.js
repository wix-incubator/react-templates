define(['react', 'react-dom', 'lodash', 'jquery', './libs/codemirror-4.8/lib/codemirror',
        './libs/codemirror-4.8/mode/javascript/javascript',
        './libs/codemirror-4.8/mode/xml/xml',
        './libs/codemirror-4.8/addon/runmode/runmode'
], function (React, ReactDOM, _, $, CodeMirror) {
    'use strict';
    return React.createClass({
        displayName: 'CodeMirrorViewer',
        propTypes: {
            id: React.PropTypes.string,
            mode: React.PropTypes.string,
            value: React.PropTypes.string,
            valueLink: React.PropTypes.string
        },
        getDefaultProps: function () {
            return {mode: 'html'};
        },
        getInitialState: function () {
            return {editorId: _.uniqueId()};
        },
        render: function () {
            var props = _.omit(this.props, ['ref', 'key', 'value', 'valueLink', 'onChange']);
            props.id = this.props.id || this.state.editorId;
            props.className = 'cm-s-default';
            var value = this.props.valueLink ? this.props.valueLink() : this.props.value;
            return React.DOM.pre(props, value);
        },
        componentWillUpdate: function (nextProps/*, nextState*/) {
            var value = nextProps.valueLink ? nextProps.valueLink() : nextProps.value;
            if (this.editor && this.editor.getValue() !== value) {
                this.editor.setValue(value || '');
            }
        },
        componentDidMount: function () {
            var value = this.props.valueLink ? this.props.valueLink() : this.props.value;
            var mode = this.props.mode;
            if (this.props.mode === 'html') {
                mode = 'text/html';
            }
            this.editor = CodeMirror.runMode(value, mode, ReactDOM.findDOMNode(this));
        },
        componentWillUnmount: function () {
            this.editor.toTextArea();
        }
    });
});
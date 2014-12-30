define(['react', 'lodash', 'jquery', './libs/codemirror-4.8/lib/codemirror',
        './libs/codemirror-4.8/mode/javascript/javascript',
        './libs/codemirror-4.8/addon/hint/html-hint',
        './libs/codemirror-4.8/addon/hint/show-hint',
        './libs/codemirror-4.8/addon/hint/xml-hint',
        './libs/codemirror-4.8/addon/hint/html-hint',
        './libs/codemirror-4.8/mode/xml/xml',
        './libs/codemirror-4.8/addon/runmode/runmode'
], function (React, _, $, CodeMirror) {
    'use strict';
    return React.createClass({
        displayName: 'CodeMirrorViewer',
        propTypes: {
            id: React.PropTypes.string,
            runMode: React.PropTypes.bool,
            mode: React.PropTypes.string
        },
        getDefaultProps: function () {
            return {
                readOnly: false,
                runMode: true,
                mode: 'html'
            };
        },
        getInitialState: function () {
            return {
                editorId: _.uniqueId()
            };
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
            var options = {
                readOnly: this.props.readOnly,
                lineWrapping: true,
                smartIndent: true,
                matchBrackets: true,
                value: value,
                lineNumbers: true,
                mode: 'javascript',
                gutters: ['CodeMirror-linenumbers', 'rt-annotations'],
                theme: 'solarized'
            };

            if (this.props.mode === 'html') {
                options.mode = 'text/html';
            } else {
                options.mode = 'javascript';
            }

            this.editor = CodeMirror.runMode(value, options.mode, this.getDOMNode());
        },
        componentWillUnmount: function () {
            this.editor.toTextArea();
        }
    });
});
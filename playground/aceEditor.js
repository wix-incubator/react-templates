/**
 * Created by avim on 11/25/2014.
 */
'use strict';
var React = require('react/addons');
var _ = require('lodash');
var brace = require('brace');

require('brace/mode/javascript');
require('brace/mode/html');
require('brace/theme/monokai');

var editor = React.createClass({
    displayName: 'BraceEditor',
    getInitialState: function () {
        return {
            editorId: _.uniqueId()
        };
    },
    componentWillMount: function () {

    },
    render: function () {
        var props = _.omit(this.props, ['id', 'ref', 'key', 'value', 'valueLink', 'onChange']);
        props.id = this.state.editorId;
        return React.DOM.div(props);
    },
    componentWillUpdate: function (nextProps/*, nextState*/) {
        var value = nextProps.valueLink ? nextProps.valueLink() : nextProps.value;
        if (this.editor && this.editor.getValue() != value) {
            this.editor.setValue(value, 0);
        }
    },
    componentDidMount: function () {
        this.editor = brace.edit(this.state.editorId);
//        this.editor.setTheme('ace/theme/monokai');
        this.editor.setTheme('ace/theme/solarized_light');
        if (this.props.mode !== 'html') {
            this.editor.getSession().setMode('ace/mode/javascript');
        } else {
            this.editor.getSession().setMode('ace/mode/html');
        }
        this.editor.getSession().setUseWorker(false);

        var value = this.props.valueLink ? this.props.valueLink() : this.props.value;
        this.editor.setValue(value, 0);
        if (this.props.readOnly) {
            this.editor.setReadOnly(true);
        } else {
            this.editor.setReadOnly(false);
            this.editor.on('change', function (/*e*/) {
                if (this.props.valueLink) {
                    this.props.valueLink(this.editor.getValue());
                } else if (this.props.onChange) {
                    this.props.onChange({target: {value: this.editor.getValue()}});
                }
            }.bind(this));
        }
        this.editor.clearSelection();
    },
    componentWillUnmount: function () {
        this.editor.destroy();
    }
});

module.exports = editor;
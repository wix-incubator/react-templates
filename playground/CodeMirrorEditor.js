define(['react', 'lodash', 'jquery', './libs/codemirror-4.8/lib/codemirror',
        './libs/codemirror-4.8/mode/javascript/javascript',
        './libs/codemirror-4.8/addon/hint/html-hint',
        './libs/codemirror-4.8/addon/hint/show-hint',
        './libs/codemirror-4.8/addon/hint/xml-hint',
        './libs/codemirror-4.8/addon/hint/html-hint',
        './libs/codemirror-4.8/addon/display/panel',
        './libs/codemirror-4.8/mode/xml/xml',
        './libs/codemirror-4.8/mode/css/css',
        './libs/codemirror-4.8/mode/htmlmixed/htmlmixed'
        //'./libs/codemirror-4.8/addon/display/placeholder'
], function (React, _, $, CodeMirror) {
    'use strict';
    //codeMirror: 'libs/codemirror-4.8/lib/codemirror',
    //htmlmixed: 'libs/codemirror-4.8/mode/htmlmixed/htmlmixed',
    //javascript: 'libs/codemirror-4.8/mode/javascript/javascript'

    var rtSchema = {
        div: {
            attrs: {
                'rt-props': null,
                'rt-if': null,
                'rt-repeat': null,
                'rt-class': null,
                'rt-scope': null,
                valueLink: null,
                key: null
            }
        }
    };
    var tags = CodeMirror.htmlSchema;
    Object.keys(CodeMirror.htmlSchema).forEach(function (i) {
        tags[i].attrs = _.defaults(rtSchema.div.attrs, tags[i].attrs);
    });

    function completeAfter(cm, pred) {
        //var cur = cm.getCursor();
        if (!pred || pred()) {
            setTimeout(function () {
                if (!cm.state.completionActive) {
                    cm.showHint({completeSingle: false});
                }
            }, 100);
        }
        return CodeMirror.Pass;
    }

    function completeIfAfterLt(cm) {
        return completeAfter(cm, function () {
            var cur = cm.getCursor();
            /*eslint new-cap:0*/
            return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) === '<';
        });
    }

    function completeIfInTag(cm) {
        return completeAfter(cm, function () {
            var tok = cm.getTokenAt(cm.getCursor());
            if (tok.type === 'string' && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length === 1)) {
                return false;
            }
            var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
            return inner.tagName;
        });
    }

    var editor = React.createClass({
        displayName: 'CodeMirrorEditor',
        getInitialState: function () {
            return {
                editorId: _.uniqueId()
            };
        },
        componentWillMount: function () {
        },
        render: function () {
            var props = _.omit(this.props, ['ref', 'key', 'value', 'valueLink', 'onChange']);
            props.id = this.props.id || this.state.editorId;
            return React.DOM.div(props);
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
                theme: 'solarized' //solarized_light solarized-light
            };

            if (this.props.mode === 'html') {
                options.mode = 'text/html';
                options.extraKeys = {
                    "'<'": completeAfter,
                    "'/'": completeIfAfterLt,
                    "' '": completeIfInTag,
                    "'='": completeIfInTag,
                    'Ctrl-Space': 'autocomplete'
                };
                options.hintOptions = {schemaInfo: tags};
                options.gutters = ['CodeMirror-lint-markers'];
                options.lint = true;
            } else {
                options.mode = 'javascript';
                options.gutters = ['CodeMirror-lint-markers'];
                options.lint = true;
            }

            this.editor = new CodeMirror(document.getElementById(this.props.id || this.state.editorId), options);

            if (!this.props.readOnly) {
                this.editor.on('change', function (/*e*/) {
                    if (this.props.valueLink) {
                        this.props.valueLink(this.editor.getValue());
                    } else if (this.props.onChange) {
                        this.props.onChange({target: {value: this.editor.getValue()}});
                    }
                }.bind(this));
            }
        },
        showMessage: function (msg) {
            var anOption = document.createElement('div');
            anOption.innerText = msg;
            anOption.setAttribute('class', 'error-panel');
            if (this.panel) {
                this.panel.clear();
            }
            this.panel = this.editor.addPanel(anOption, {height: 22}); // {position: 'bottom'}
        },
        clearMessage: function () {
            if (this.panel) {
                this.panel.clear();
                this.panel = null;
            }
        },
        componentWillUnmount: function () {
            this.editor.destroy();
        }
    });

    return editor;
});
/*eslint-env browser*/
define(['react', 'jquery', 'lodash', './playground-fiddle.rt', './playground.rt'], function (React, $, _, pgFiddleTemplate, playgroundTemplate) {
    'use strict';
    function emptyFunc() {
        return null;
    }

    /**
     * @param {string} html
     * @param editor
     * @param {string} name
     * @return {string}
     */
    function generateTemplateSource(html, editor, name) {
        var code = null;
        try {
            code = window.reactTemplates.convertTemplateToReact(html.trim().replace(/\r/g, ''), {modules: 'none', name: name});
            clearMessage(editor);
        } catch (e) {
            if (e.name === 'RTCodeError') {
                //index: -1 line: -1 message: "Document should have a root element" name: "RTCodeError"
                editor.annotate({line: e.line, message: e.message, index: e.index});
            } else {
                editor.annotate({line: 1, message: e.message});
            }
            //showMessage(editor, msg);
            console.log(e);
        }
        return code;
    }

    function showMessage(editor, msg) {
        if (editor && editor.showMessage) {
            editor.annotate({line: 1, message: msg});
        }
    }

    function clearMessage(editor) {
        if (editor && editor.clearMessage) {
            editor.clearAnnotations();
        }
    }

    function generateTemplateFunction(code) {
        try {
            var defineMap = {'react/addons': React, lodash: _};
            var define = function (requirementsNames, content) {
                var requirements = _.map(requirementsNames, function (reqName) {
                    return defineMap[reqName];
                });
                return content.apply(this, requirements);
            };
            /*eslint no-eval:0*/
            var res = eval(code);
            return res;
        } catch (e) {
            console.log(e);
            return emptyFunc;
        }
    }

    function generateRenderFunc(renderFunc) {
        return function () {
            var res = null;
            try {
                res = renderFunc.apply(this);
            } catch (e) {
                res = React.DOM.div.apply(this, [{style: {color: 'red'}}, 'Exception:' + e.message]);
            }
            return React.DOM.div.apply(this, _.flatten([
                {key: 'result'},
                res
            ]));
        };
    }

    var templateHTML = '<div></div>';
    var templateProps = 'var template = React.createClass({\n' +
        '   render: function () {\n' +
        '       return templateRT.apply(this);\n' +
        '   }\n' +
        '});';

    var selfCleaningTimeout = {
        componentDidUpdate: function() {
            clearTimeout(this.timeoutID);
        },
        setTimeout: function() {
            console.log('setTimeout');
            clearTimeout(this.timeoutID);
            this.timeoutID = setTimeout.apply(null, arguments);
        }
    };

    var Playground = React.createClass({
        displayName: 'Playground',
        mixins: [React.addons.LinkedStateMixin],
        propTypes: {
            direction: React.PropTypes.oneOf(['horizontal', 'vertical']),
            codeVisible: React.PropTypes.bool,
            fiddle: React.PropTypes.bool
        },
        templateSource: '',
        validHTML: true,
        validProps: true,
        setTimeout: function() {
            console.log('setTimeout');
            clearTimeout(this.timeoutID);
            this.timeoutID = setTimeout.apply(null, arguments);
        },
        getDefaultProps: function () {
            return {
                direction: 'horizontal', //vertical
                codeVisible: true,
                fiddle: false
            };
        },
        getLayoutClass: function () {
            return (this.props.direction === 'horizontal' && 'horizontal') || 'vertical';
        },
        //executeCode: function() {
        //    var mountNode = this.refs.mount.getDOMNode();
        //
        //    try {
        //        React.unmountComponentAtNode(mountNode);
        //    } catch (e) { }
        //
        //    try {
        //        var compiledCode = this.compileCode();
        //        if (this.props.renderCode) {
        //            React.render(
        //                React.createElement(CodeMirrorEditor, {codeText: compiledCode, readOnly: true}),
        //                mountNode
        //            );
        //        } else {
        //            eval(compiledCode);
        //        }
        //    } catch (err) {
        //        this.setTimeout(function() {
        //            React.render(
        //                React.createElement('div', {className: 'playgroundError'}, err.toString()),
        //                mountNode
        //            );
        //        }, 500);
        //    }
        //},
        getTabs: function () {
            if (this.props.codeVisible) {
                return [['templateHTML', 'Template'], ['templateProps', 'Class'], ['templateSource', 'Generated code']];
            } else {
                return [['templateHTML', 'Template'], ['templateSource', 'Generated code']];
            }
        },
        updateSample: function (state) {

            //try {
            //    React.unmountComponentAtNode(mountNode);
            //} catch (e) { }

            this.generateCode(state);
            //this.sampleFunc = generateTemplateFunction(this.templateSource);
            //this.validHTML = this.sampleFunc !== emptyFunc;
            this.validHTML = true;
            this.sampleRender = generateRenderFunc(this.sampleFunc);
            //var classBase = {};
            try {
                this.validProps = true;
                console.log(state.templateProps);
                //classBase = eval(this.templateSource + '\n' + state.templateProps);
                //if (!_.isObject(classBase)) {
                //    throw 'failed to eval';
                //}
                this.sample = eval('(function () {' + this.templateSource + '\n' + state.templateProps + '\n return React.createElement(' + state.name + ');})()');

                clearMessage(this.refs.editorCode);
            } catch (e) {
                //classBase = {};
                this.validProps = false;
                this.sample = null;
                var editor = this.refs.editorCode;
                this.setTimeout(function() {
                    showMessage(editor, e.message);
                    console.log('setTimeout playgroundError');
                    React.render(
                        React.createElement('div', {className: 'playground-error'}, e.toString()),
                        mountNode
                    );
                }, 500);
            }
            //classBase.render = this.sampleRender;
            //this.sample = React.createFactory(React.createClass(classBase));
        },
        clear: function () {
            //console.log('clear');
            var currentState = {
                templateHTML: templateHTML,
                templateProps: templateProps
            };
            //this.updateSample(currentState);
            this.setState(currentState);
        },
        getInitialState: function () {
            var currentState = {
                templateHTML: this.props.templateHTML || templateHTML,
                templateProps: this.props.templateProps || templateProps,
                name: this.props.name || 'template',
                currentTab: 'templateHTML'
            };
            //this.updateSample(currentState);
            return currentState;
        },
        componentDidMount: function() {
            if (this.props.fiddle) {
                window.addEventListener('resize', this.calcSize);
                this.calcSize();
            }
            this.updateSample(this.state);
            this.renderSample();
        },
        renderSample: function () {
            var mountNode = this.refs.mount.getDOMNode();
            if (this.sample) {
                React.render(this.sample, mountNode);
            }
        },
        componentDidUpdate: function () {
            this.renderSample();
        },
        componentWillUnmount: function(){
            window.removeEventListener('resize', this.calcSize);
        },

        calcSize: function() {
            var contentHeight = $(window).height() - $('#header').height();
            var height = contentHeight / 2 - 10;

            $('.code-area').each(function (i, k) {
                $(this).height(height);
                console.log($(this).height());
            });
            this.refs.editorCode.editor.refresh();
            this.refs.editorRT.editor.refresh();
            this.refs.editorGenerated.editor.refresh();
        },
        componentWillUpdate: function (nextProps, nextState) {
            if (nextState.templateHTML !== this.state.templateHTML || nextState.templateProps !== this.state.templateProps) {
                this.updateSample(nextState);
            }
        },
        render: function () {
            this.generateCode(this.state);
            var template = this.props.fiddle ? pgFiddleTemplate : playgroundTemplate;
            return template.apply(this);
        },
        generateCode: function (state) {
            this.templateSource = generateTemplateSource(state.templateHTML, this.refs.editorRT, window.reactTemplates.normalizeName(state.name) + 'RT');
        }
    });

    return Playground;
});

'use strict';
/*eslint-env browser*/
define(['react', 'lodash', './playground-fiddle.rt', './playground.rt'], function (React, _, pgFiddleTemplate, playgroundTemplate) {
    function emptyFunc() {
        return null;
    }

    function generateTemplateSource(html) {
        var code = null;
        try {
            code = window.reactTemplates.convertTemplateToReact(html.trim().replace(/\r/g, ''));
        } catch (e) {
            if (e.name === 'RTCodeError') {
                console.log('');
                //index: -1 line: -1 message: "Document should have a root element" name: "RTCodeError"
            }
            console.log('' + e);
        }
        return code;
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
            console.log('' + e);
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
    var templateProps = '{}';

    var Playground = React.createClass({

        displayName: 'Playground',
        mixins: [React.addons.LinkedStateMixin],
        propTypes: {
            direction: React.PropTypes.string,
            codeVisible: React.PropTypes.bool,
            fiddle: React.PropTypes.bool
        },
        getDefaultProps: function () {
            return {
                direction: 'horizontal', //vertical
                codeVisible: true,
                fiddle: false
            };
        },
        updateSample: function (state) {
            this.templateSource = generateTemplateSource(state.templateHTML);
            this.sampleFunc = generateTemplateFunction(this.templateSource);
            this.validHTML = this.sampleFunc !== emptyFunc;
            this.sampleRender = generateRenderFunc(this.sampleFunc);
            var classBase = {};
            try {
                this.validProps = true;
                console.log(state.templateProps);
                classBase = eval('(' + state.templateProps + ')');
                if (!_.isObject(classBase)) {
                    throw 'failed to eval';
                }
            } catch (e) {
                classBase = {};
                this.validProps = false;
            }
            classBase.render = this.sampleRender;
            this.sample = React.createFactory(React.createClass(classBase));
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
                templateProps: this.props.templateProps || templateProps
            };
            this.updateSample(currentState);
            return currentState;
        },
        componentWillUpdate: function (nextProps, nextState) {
            if (nextState.templateHTML !== this.state.templateHTML || nextState.templateProps !== this.state.templateProps) {
                this.updateSample(nextState);
            }
        },

        render: function () {
            var template = this.props.fiddle ? pgFiddleTemplate : playgroundTemplate;
            return template.apply(this);
        }
    });

    return Playground;
});

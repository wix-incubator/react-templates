var reactTemplates = require('../src/reactTemplates');
var playgroundTemplate = require('./playground.rt.js');
var React = require('react/addons');
var _ = require('lodash');


var html = "<div>hello</div>";
var res = reactTemplates.convertTemplateToReact(html.trim());
console.log(res);

function emptyFunc() {
    return null;
}

function generateTemplateFunction(html) {
    try {
        var code = reactTemplates.convertTemplateToReact(html.trim().replace(/\r/g,""));
        var defineMap = {"react":React,"lodash":_};
        var define = function (requirementsNames,content) {
            var requirements = _.map(requirementsNames,function (reqName) {
                return defineMap[reqName];
            });
            return content.apply(this,requirements);
        };
        var res = eval(code);
        return res;
    } catch (e) {
        return emptyFunc
    }
}

function generateRenderFunc(renderFunc) {
    return function() {
        var res = null;
        try {
            res = renderFunc.apply(this)
        } catch (e) {

        }
        return React.DOM.div.apply(this, _.flatten([
            {},
            res
        ]));
    }
}
var z = {getInitialState: function() {return {name:"reactTemplates"}}};

var Playground = React.createClass({

    displayName: 'Playground',
    mixins: [React.addons.LinkedStateMixin],

    updateSample: function (state) {

        this.sampleFunc = generateTemplateFunction(state.templateHTML);
        this.sampleRender = generateRenderFunc(this.sampleFunc);
        var classBase = {};
        try {
            console.log(state.templateProps);
            classBase = eval("("+state.templateProps+")");
            /*if (typeof classBase !== 'Object') {
                throw "failed to eval";
            }*/
        } catch (e) {
            classBase = {};
        }
        classBase.render = this.sampleRender;
        console.log(classBase);
        this.sample = React.createClass(classBase);
    },

    getInitialState: function () {
        var currentState = {
            templateHTML: '<div>\n hello {this.state.name}\n</div>',
            templateProps: '{getInitialState: function () {return {name:"reactTemplates"}}}'
        };
        this.updateSample(currentState);
        return currentState;
    },
    componentWillUpdate: function (nextProps,nextState) {
        if (nextState.templateHTML !== this.state.templateHTML || nextState.templateProps !== this.state.templateProps) {
            this.updateSample(nextState);
        }
    },

    render: function () {
        return playgroundTemplate.apply(this);
    }
});

React.render(Playground(),document.getElementById('playground'));

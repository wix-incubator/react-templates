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

var Playground = React.createClass({

    displayName: 'Playground',
    mixins: [React.addons.LinkedStateMixin],

    getInitialState: function () {
        var currentState = {
            templateHTML: '<div>\n hello {this.state.name}\n</div>',
            templateProps: JSON.stringify({name:"reactTemplates"})
        };
        this.templateFunc = generateTemplateFunction(currentState.templateHTML);
        console.log(this.templateFunc);
        return currentState;
    },
    componentWillUpdate: function (nextProps,nextState) {
        if (nextState.templateHTML !== this.state.templateHTML) {
            this.templateFunc = generateTemplateFunction(nextState.templateHTML)
        }
    },

    render: function () {
        return playgroundTemplate.apply(this);
    }
});

React.render(Playground(),document.getElementById('playground'));

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
var templateHTML =  '<div>\n   Have {_.filter(this.state.todos, {done:true}).length} todos done, \n   and {_.filter(this.state.todos, {done:false}).length} not done\n  <br/>\n   <div rt-repeat="todo in this.state.todos" key="{todo.key}">\n      <button onClick="()=>this.setState({todos:_.reject(this.state.todos, todo)})">Remove</button>\n      <input type="checkbox" checked="{todo.done}" onChange="()=>var td = _.cloneDeep(this.state.todos); td[todoIndex].done = !td[todoIndex].done, this.setState({todos:td})"/>\n      <span style="{todo.done ? {\'text-decoration\':\'line-through\'} : {} }">{todo.value}</span>\n   </div>\n   <input key="myinput" type="text" onKeyDown="(e) => if (e.keyCode == 13) { this.add(); }" valueLink="{this.linkState(\'edited\')}"/>\n        <button onClick="(e)=>e.preventDefault(); this.add()" >Add</button><br/>\n   <button onClick="(e)=>e.preventDefault(); this.setState({todos: _.filter(this.state.todos, {done:false})})">Clear done</button>\n</div>';
var templateProps = '{\nmixins: [React.addons.LinkedStateMixin],\ngetInitialState: function () {\n return {edited: "", todos: [], counter: 0};\n},\nadd: function () {\n this.setState({todos: this.state.todos.concat({value: this.state.edited, done: false,key:this.state.counter}), edited: "", counter: this.state.counter+1})\n}\n}';

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
            templateHTML:templateHTML,
            templateProps: templateProps
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

var reactTemplates = require('../src/reactTemplates');
var playgroundTemplate = require('./playground.rt.js');
var htmlMode = require('codemirror/mode/htmlmixed/htmlmixed');
var javascriptMode = require('codemirror/mode/javascript/javascript');
var xmlMode = require('codemirror/mode/xml/xml');
var cssMode = require('codemirror/mode/css/css');
var vbScriptMode = require('codemirror/mode/vbscript/vbscript');

var React = require('react/addons');

var _ = require('lodash');


var html = "<div>hello</div>";
var res = reactTemplates.convertTemplateToReact(html.trim());
console.log(res);

function emptyFunc() {
    return null;
}

function generateTemplateSource(html) {
    var code = null;
    try {
        code = reactTemplates.convertTemplateToReact(html.trim().replace(/\r/g, ""));
    } catch (e) {
    }
    return code;
}

function generateTemplateFunction(code) {
    try {
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
            res = React.DOM.div.apply(this,[{style:{color:"red"}},"Exception:"+e.message]);
        }
        return React.DOM.div.apply(this, _.flatten([
            {key:"result"},
            res
        ]));
    }
}
var z = {getInitialState: function() {return {name:"reactTemplates"}}};
var templateHTML = "<div>\n    Have {_.filter(this.state.todos, {done:true}).length} todos done,\n    and {_.filter(this.state.todos, {done:false}).length} not done\n    <br/>\n    <div rt-repeat=\"todo in this.state.todos\" key=\"{todo.key}\">\n        <button onClick=\"(e)=>e.preventDefault(); this.remove(todo)\">x</button>\n        <input type=\"checkbox\" checked=\"{todo.done}\" onChange=\"()=>this.toggleChecked(todoIndex)\"/>\n        <span style=\"text-decoration: {todo.done ? 'line-through': 'none'}\">{todo.value}</span>\n    </div>\n    <input key=\"myinput\" type=\"text\" onKeyDown=\"(e) => if (e.keyCode == 13) { this.add(); }\" valueLink=\"{this.linkState('edited')}\"/>\n    <button onClick=\"(e)=>e.preventDefault(); this.add()\" >Add</button><br/>\n    <button onClick=\"(e)=>e.preventDefault(); this.clearDone()\">Clear done</button>\n</div>";
var templateProps = "{\n    mixins: [React.addons.LinkedStateMixin],\n    getInitialState: function () {\n        return {edited: '', todos: [], counter: 0};\n    },\n    add: function () {\n    if (this.state.edited.trim().length === 0) {\n        return;\n    }\n        var newTodo = {value: this.state.edited, done: false, key: this.state.counter};\n        this.setState({todos: this.state.todos.concat(newTodo), edited: '', counter: this.state.counter + 1});\n    },\n    remove: function (todo) {\n        this.setState({todos: _.reject(this.state.todos, todo)});\n    },\n    toggleChecked: function (index) {\n        var todos = _.cloneDeep(this.state.todos);\n        todos[index].done = !todos[index].done;\n        this.setState({todos: todos});\n    },\n    clearDone: function () {\n        this.setState({todos: _.filter(this.state.todos, {done: false})});\n    }\n}";

var Playground = React.createClass({

    displayName: 'Playground',
    mixins: [React.addons.LinkedStateMixin],

    updateSample: function (state) {
        this.templateSource = generateTemplateSource(state.templateHTML);
        this.sampleFunc = generateTemplateFunction(this.templateSource);
        this.validHTML = this.sampleFunc !== emptyFunc;
        this.sampleRender = generateRenderFunc(this.sampleFunc);
        var classBase = {};
        try {
            this.validProps = true;
            console.log(state.templateProps);
            classBase = eval("("+state.templateProps+")");
            if (!_.isObject(classBase)) {
                throw "failed to eval";
            }
        } catch (e) {
            classBase = {};
            this.validProps = false;
        }
        classBase.render = this.sampleRender;
        console.log(classBase);
        this.sample = React.createFactory(React.createClass(classBase));
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

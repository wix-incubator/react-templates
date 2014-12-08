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

    //var z = {getInitialState: function () {return {name: 'reactTemplates'};}};
    //var templateHTML = '<div>\n' +
    //    'Have {_.filter(this.state.todos, {done:true}).length} todos done,\n' +
    //    'and {_.filter(this.state.todos, {done:false}).length} not done\n' +
    //    '    <br/>\n' +
    //    '    <div rt-repeat="todo in this.state.todos" key="{todo.key}">\n' +
    //    '        <button onClick="()=>this.remove(todo)">x</button>\n' +
    //    '        <input type="checkbox" checked="{todo.done}" onChange="()=>this.toggleChecked(todoIndex)"/>\n' +
    //    '        <span style="text-decoration: {todo.done ? \'line-through\': \'none\'}">{todo.value}</span>\n' +
    //    '    </div>\n' +
    //    '    <input key="myinput" type="text" onKeyDown="(e) => if (e.keyCode == 13) { e.preventDefault(); this.add(); }" valueLink="{this.linkState(\'edited\')}"/>\n' +
    //    '    <button onClick="()=>this.add()">Add</button><br/>\n' +
    //    '    <button onClick="()=>this.clearDone()">Clear done</button>\n' +
    //    '</div>';
    var templateHTML = '<div></div>';
    var templateProps = '{}';
    //var templateProps = "{\n    mixins: [React.addons.LinkedStateMixin],\n    getInitialState: function () {\n        return {edited: '', todos: [], counter: 0};\n    },\n    add: function () {\n    if (this.state.edited.trim().length === 0) {\n        return;\n    }\n        var newTodo = {value: this.state.edited, done: false, key: this.state.counter};\n        this.setState({todos: this.state.todos.concat(newTodo), edited: '', counter: this.state.counter + 1});\n    },\n    remove: function (todo) {\n        this.setState({todos: _.reject(this.state.todos, todo)});\n    },\n    toggleChecked: function (index) {\n        var todos = _.cloneDeep(this.state.todos);\n        todos[index].done = !todos[index].done;\n        this.setState({todos: todos});\n    },\n    clearDone: function () {\n        this.setState({todos: _.filter(this.state.todos, {done: false})});\n    }\n}";

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

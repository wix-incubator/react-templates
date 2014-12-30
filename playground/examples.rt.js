define([
    'react/addons',
    'lodash',
    './playground',
    './CodeMirrorViewer'
], function (React, _, playground, viewer) {
    'use strict';
    return function () {
        return React.createElement('div', { 'id': 'examples' }, React.createElement('div', { 'className': 'example' }, React.createElement('h3', {}, 'Hello world in react templates'), React.createElement('p', {}, '\n            Simple hello world html transformed into react javascript code\n        '), React.createElement(playground, _.merge({}, {
            'id': 'helloExample',
            'direction': 'horizontal'
        }, this.state.samples.hello))), React.createElement('div', { 'className': 'example' }, React.createElement('h3', {}, 'This shows the use of rt-if'), React.createElement('p', {}, '\n            This shows the use of rt-if\n        '), React.createElement(playground, _.merge({}, {
            'id': 'ifExample',
            'direction': 'horizontal'
        }, this.state.samples.rtIf))), React.createElement('div', { 'className': 'example' }, React.createElement('h3', {}, 'This shows the use of rt-repeat'), React.createElement('p', {}, '\n            This shows the use of rt-repeat, to show multiple items, and the use of rt-scope to create a reusable name for multiple calculations\n        '), React.createElement(playground, _.merge({}, {
            'id': 'repeatExample',
            'direction': 'horizontal'
        }, this.state.samples.repeat))), React.createElement('div', { 'className': 'example' }, React.createElement('h3', {}, 'This shows the use of rt-props'), React.createElement('p', {}, '\n            This shows the use of rt-props. It is used in this component to pass all the original properties set on this component (except the ones used for the component logic - onClick and eventId) to the element that will actually represent this component\n        '), React.createElement(playground, _.merge({}, {
            'id': 'propsExample',
            'direction': 'horizontal'
        }, this.state.samples.props))), React.createElement('div', { 'className': 'example' }, React.createElement('h3', {}, 'Improved todo list'), React.createElement('p', {}, '\n            This shows the use of rt-props. It is used in this component to pass all the original properties set on this component (except the ones used for the component logic - onClick and eventId) to the element that will actually represent this component\n        '), React.createElement(playground, _.merge({}, {
            'id': 'todoExample',
            'direction': 'horizontal'
        }, this.state.samples.todo))), React.createElement('div', { 'className': 'example' }, React.createElement('h3', {}, 'Weather'), React.createElement('p', {}, '\n            This example shows working with async events, usage of regular event handler function pointers instead of lambda expression, and working with 2 way binding\n        '), React.createElement(playground, _.merge({}, {
            'id': 'weatherExample',
            'direction': 'horizontal'
        }, this.state.samples.weather))), React.createElement('div', {
            'id': 'amd',
            'className': 'example'
        }, React.createElement('h3', {}, 'AMD'), React.createElement('p', {}, '\n            This example shows the hello sample output with AMD support.\n        '), React.createElement(viewer, _.merge({}, { 'mode': 'javascript' }, this.state.amd))), React.createElement('div', {
            'id': 'commonjs',
            'className': 'example'
        }, React.createElement('h3', {}, 'CommonJS'), React.createElement('p', {}, '\n            This example shows the hello sample output with CommonJS support.\n        '), React.createElement(viewer, _.merge({}, { 'mode': 'javascript' }, this.state.cjs))));
    };
});
var React = require('react/addons');
var _ = require('lodash');
var playground = require('./playground');
'use strict';
module.exports = function () {
    return React.DOM.div({ 'id': 'examples' }, React.DOM.div({ 'className': 'example' }, React.DOM.h3({}, 'Hello world in react templates'), React.DOM.p({}, '\n            Simple hello world html transformed into react javascript code\n        '), playground(_.merge({}, {
        'id': 'helloExample',
        'direction': 'horizontal',
        'style': { display: 'block' }
    }, this.state.samples[0]))), React.DOM.div({ 'className': 'example' }, React.DOM.h3({}, 'A Stateful Component'), React.DOM.p({}, '\n            In addition to taking input data (accessed via ', React.DOM.code({}, 'this.props'), '), a\n            component can maintain internal state data (accessed via ', React.DOM.code({}, 'this.state'), ').\n            When a component\'s state data changes, the rendered markup will be\n            updated by re-invoking ', React.DOM.code({}, 'render()'), '.\n        '), React.DOM.div({ 'id': 'timerExample' }), playground(_.merge({}, {
        'id': 'example2',
        'direction': 'horizontal',
        'style': { display: 'block' }
    }, this.state.samples[1]))), React.DOM.div({ 'className': 'example' }, React.DOM.h3({}, 'An Application'), React.DOM.p({}, '\n            Using ', React.DOM.code({}, 'props'), ' and ', React.DOM.code({}, 'state'), ', we can put together a small Todo application.\n            This example uses ', React.DOM.code({}, 'state'), ' to track the current list of items as well as\n            the text that the user has entered. Although event handlers appear to be\n            rendered inline, they will be collected and implemented using event\n            delegation.\n        '), React.DOM.div({ 'id': 'todoExample' }), playground({
        'id': 'example3',
        'direction': 'horizontal',
        'style': { display: 'block' }
    })), React.DOM.div({ 'className': 'example' }, React.DOM.h3({}, 'A Component Using External Plugins'), React.DOM.p({}, '\n            React is flexible and provides hooks that allow you to interface with\n            other libraries and frameworks. This example uses Showdown, an external\n            Markdown library, to convert the textarea\'s value in real-time.\n        '), React.DOM.div({ 'id': 'markdownExample' }), playground({
        'id': 'example4',
        'direction': 'horizontal',
        'style': { display: 'block' }
    })));
};
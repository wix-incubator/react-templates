var React = require('react');
var _ = require('lodash');
var PlaygroundSample = require('./playgroundSample');
'use strict';
module.exports = function () {
    return React.DOM.div({}, React.DOM.form({}, React.DOM.textarea({
        'valueLink': this.linkState('templateHTML'),
        'className': 'large-text-area'
    }), React.DOM.br({}), React.DOM.textarea({
        'valueLink': this.linkState('templateProps'),
        'className': 'large-text-area'
    })), PlaygroundSample({
        'renderFunc': this.templateFunc,
        'stateString': this.state.templateProps
    }));
};
var React = require('react');
var _ = require('lodash');
var playGround = require('./PlayGround.js');
'use strict';
module.exports = function () {
    return React.DOM.div({}, React.DOM.h1({}, 'React Templates'), playGround(_.merge({}, {
        'ref': 'playground',
        'direction': 'horizontal'
    }, this.state.samples[0])), playGround(_.merge({}, {
        'ref': 'playground',
        'direction': 'horizontal'
    }, this.state.samples[1])));
};
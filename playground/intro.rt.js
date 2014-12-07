/*eslint new-cap:0,no-unused-vars:0*/
define([
    'react/addons',
    'lodash',
    './PlayGround.js'
], function (React, _, playGround) {
    'use strict';
    return function () {
        return React.createElement('div', {}, React.createElement('h1', {}, 'React Templates'), React.createElement(playGround, _.merge({}, {
            'ref': 'playground',
            'direction': 'horizontal'
        }, this.state.samples[0])), React.createElement(playGround, _.merge({}, {
            'ref': 'playground',
            'direction': 'horizontal'
        }, this.state.samples[1])));
    };
});
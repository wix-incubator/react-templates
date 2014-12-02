var React = require('react/addons');
var _ = require('lodash');
var playGround = require('./PlayGround.js');
'use strict';
function onClick1(evt) {
    evt.preventDefault();
    this.save();
}
module.exports = function () {
    return React.DOM.div({}, React.DOM.h1({}, 'React Templates fiddle'), React.DOM.h2({}, 'Play with react templates and save/share your results'), React.DOM.button({
        'className': 'btn btn-lg btn-primary',
        'onClick': onClick1.bind(this)
    }, 'Save fiddle'), React.DOM.br({}, playGround({
        'ref': 'playground',
        'direction': 'vertical'
    })));
};
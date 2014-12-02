'use strict';
var examplesTemplate = require('./examples.rt.js');
var React = require('react/addons');
var _ = require('lodash');

var Examples = React.createClass({

    displayName: 'Examples',
    mixins: [React.addons.LinkedStateMixin],

    render: function () {
        return examplesTemplate.apply(this);
    }
});

module.exports = Examples;
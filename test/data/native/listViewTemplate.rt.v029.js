'use strict';
var ReactNative = require('react-native');
var React = require('react');
module.exports = function () {
    function renderRow1(rowData) {
        return React.createElement(ReactNative.Text, {}, rowData);
    }
    return React.createElement(ReactNative.View, {}, React.createElement(ReactNative.ListView, {
        'dataSource': this.state.dataSource,
        'renderRow': renderRow1.bind(this)
    }));
};
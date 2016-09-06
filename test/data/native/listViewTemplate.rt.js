'use strict';
var React = require('react-native');
module.exports = function () {
    function renderRow1(rowData) {
        return React.createElement(React.Text, {}, rowData);
    }
    return React.createElement(React.View, {}, React.createElement(React.ListView, {
        'dataSource': this.state.dataSource,
        'renderRow': renderRow1.bind(this)
    }));
};
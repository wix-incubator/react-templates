define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    function renderRow1(rowData) {
        return React.createElement('div', {}, rowData);
    }
    return function () {
        return React.createElement('div', {}, React.createElement(List, {
            'data': [
                1,
                2,
                3
            ],
            'renderRow': renderRow1.bind(this)
        }));
    };
});
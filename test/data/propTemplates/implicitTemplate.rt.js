define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        function renderRow1(rowData) {
            return React.createElement('div', {}, rowData);
        }
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

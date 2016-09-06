define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        function repeatA1(a, aIndex) {
            return React.createElement('span', {}, a);
        }
        return React.createElement.apply(this, [
            'div',
            {},
            _.map([
                1,
                2,
                3
            ], repeatA1.bind(this))
        ]);
    };
});

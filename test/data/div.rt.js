define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        return React.DOM.div.apply(this, _.flatten([{}].concat([])));
    };
});
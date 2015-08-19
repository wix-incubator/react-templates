define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    function templateProp1(arg1) {
        return React.createElement('div', {}, arg1);
    }
    return function () {
        return React.createElement('div', { 'templateProp': templateProp1.bind(this) });
    };
});
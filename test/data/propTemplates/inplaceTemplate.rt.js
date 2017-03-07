define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        function templateProp1() {
            return React.createElement('div', {}, 'some');
        }
        return React.createElement('div', { 'templateProp': templateProp1.call(this) });
    };
});

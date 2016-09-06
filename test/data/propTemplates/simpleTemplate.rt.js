define(['react'], function (React) {
    'use strict';
    return function () {
        function templateProp1(arg1) {
            return React.createElement('div', {}, arg1);
        }
        return React.createElement('div', { 'templateProp': templateProp1.bind(this) });
    };
});

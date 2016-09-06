define(['react'], function (React) {
    'use strict';
    return function () {
        function templateProp21(arg1, inner1, inner2) {
            return React.createElement('div', {}, arg1 + inner1 + inner2);
        }
        function templateProp2(arg1) {
            return React.createElement('div', { 'templateProp2': templateProp21.bind(this, arg1) }, React.createElement('div', {}, arg1));
        }
        return React.createElement('div', { 'templateProp': templateProp2.bind(this) });
    };
});

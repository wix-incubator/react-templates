define(['react'], function (React) {
    'use strict';
    return function () {
        return React.createElement('div', {}, React.createElement('input', {
            'type': 'text',
            'name': 'first'
        }), React.createElement('input', {
            'type': 'text',
            'name': 'second'
        }));
    };
});

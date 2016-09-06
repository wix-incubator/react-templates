define(['react'], function (React) {
    'use strict';
    return function () {
        return React.createElement('div', {}, React.createElement('span', {
            'style': {
                MozTransform: '2',
                msTransform: '2',
                OTransform: '2',
                WebkitTransform: '2',
                transform: '2'
            }
        }), React.createElement('span', {
            'style': {
                MozTransform: '2',
                msTransform: '2',
                OTransform: '2',
                WebkitTransform: '2',
                transform: '2'
            }
        }));
    };
});
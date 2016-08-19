define(['react'], function (React) {
    'use strict';
    return function (props, context) {
        return React.createElement('div', {}, 'Hello ', props.person);
    };
});

define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function (props) {
        return React.createElement('div', {}, 'Hello ', props.person);
    };
});

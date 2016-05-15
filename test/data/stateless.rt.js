define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    return function (props, context) {
        return React.createElement('div', {}, '\n   This is a stateless component showing ', props.someProp, ' and ', context.someContextData, '\n');
    };
});

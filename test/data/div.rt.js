define([
    'react',
    'lodash'
], function (React, _) {
    return function () {
        return React.DOM.div.apply(this, _.flatten([{}].concat([])));
    };
});
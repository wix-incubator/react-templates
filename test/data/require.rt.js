define([
    'react/addons',
    'lodash',
    'comps/myComp',
    'utils/utils'
], function (React, _, myComp, utils) {
    'use strict';
    return function () {
        return React.createElement(myComp, {}, '\n', utils.translate('Hello', 'es'), '\n');
    };
});
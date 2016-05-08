define('div', [
    'react/addons',
    'lodash',
    'comps/myComp',
    'utils/utils',
    'module-name',
    'module-name',
    'module-name',
    'module-name'
], function (React, _, myComp, utils, member, alias2, alias3, alias4) {
    'use strict';
    return function () {
        return React.createElement(myComp, {}, '\n', utils.translate('Hello', 'es'), '\n');
    };
});
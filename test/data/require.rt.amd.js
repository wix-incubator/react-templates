define('div', [
    'react',
    'comps/myComp',
    'utils/utils'
], function (React, myComp, utils) {
    'use strict';
    return function () {
        return React.createElement(myComp, {}, '\n', utils.translate('Hello', 'es'), '\n');
    };
});

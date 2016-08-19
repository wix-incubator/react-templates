import * as React from 'react';
import * as myComp from 'comps/myComp';
import * as utils from 'utils/utils';
export default function () {
    return React.createElement(myComp, {}, '\n', utils.translate('Hello', 'es'), '\n');
}

import * as React from 'react/addons';
import * as _ from 'lodash';
import * as myComp from 'comps/myComp';
import * as utils from 'utils/utils';
import { member } from 'module-name';
import { member as alias2 } from 'module-name';
import * as alias3 from 'module-name';
import alias4 from 'module-name';
export default function () {
    return React.createElement(myComp, {}, '\n', utils.translate('Hello', 'es'), '\n');
}
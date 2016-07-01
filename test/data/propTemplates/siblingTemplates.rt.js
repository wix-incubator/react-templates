define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    function templateProp11(brother) {
        return React.createElement('div', {}, 'Brother: ', brother);
    }
    function templateProp22(sister) {
        return React.createElement('div', {}, 'Sister: ', sister);
    }
    function templateProp33(other) {
        return React.createElement('div', {}, 'Other: ', other);
    }
    return function () {
        return React.createElement('div', {
            'templateProp1': templateProp11.bind(this),
            'templateProp2': templateProp22.bind(this),
            'templateProp3': templateProp33.bind(this)
        }, React.createElement('div', {}, 'Separator'));
    };
});

define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        function scopeActiveUsers1() {
            var activeUsers = this.activeUsers;
            return React.createElement('div', { 'key': 'active-users' }, React.createElement('span', {}, 'some text'));
        }
        return this.activeUsers ? scopeActiveUsers1.apply(this, []) : null;
    };
});

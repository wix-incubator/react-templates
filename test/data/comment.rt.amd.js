define(['react'], function (React) {
    'use strict';
    return function () {
        return React.createElement('div', {}    /*  this is a comment  */, React.createElement('div', {}, 'hello')    /*  /* this is another comment * /  */, React.createElement('div', {}, 'hello'));
    };
});
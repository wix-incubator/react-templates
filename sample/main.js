requirejs.config({
//    baseUrl: '/',
    paths: {
        lodash: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash',
        jquery: '//code.jquery.com/jquery-1.11.0.min',
        react: '//cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react-with-addons'
    },
    shim: {
        lodash: {exports: '_'},
        jquery: {exports: '$'},
        react: {exports: 'React'}
    }
});

requirejs(['jquery', 'react', 'ImageSearch'], function ($, React, ImageSearch) {
    'use strict';
    React.renderComponent(ImageSearch(), $('#main').get(0)); //eslint-disable-line new-cap
});

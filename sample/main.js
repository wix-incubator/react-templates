'use strict';

requirejs.config({
//    baseUrl: '/',
    paths: {
        lodash: 'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash',
        jquery: 'http://code.jquery.com/jquery-1.11.0.min',
        react: 'http://fb.me/react-with-addons-0.12.0'
    },
    shim: {
        lodash: { exports: '_' },
        jquery: { exports: '$' },
        react: { exports: 'React' }
    }
});

requirejs(['jquery', 'react', 'ImageSearch'], function ($, React, ImageSearch) {
    React.renderComponent(ImageSearch(), $('#main').get(0));
});


requirejs.config({
//    baseUrl: '/',
    paths: {
        lodash: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
        jquery: '//code.jquery.com/jquery-2.1.4.min',
        firebase: '//cdn.firebase.com/js/client/2.0.5/firebase',
        react: '//cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react-with-addons',
        //ace: '../ace-builds-1.1.8/src-min/ace',
        fiddle: './fiddle',
        text: 'libs/requirejs-plugins/text',
        json: 'libs/requirejs-plugins/json',
        bootstrap: 'libs/bootstrap/bootstrap.min'
        //codeMirror: 'libs/codemirror-4.8/lib/codemirror',
        //htmlmixed: 'libs/codemirror-4.8/mode/htmlmixed/htmlmixed',
        //javascript: 'libs/codemirror-4.8/mode/javascript/javascript'
    },
    shim: {
        lodash: {exports: '_'},
        firebase: {exports: 'Firebase'},
        //ace: { exports: 'ace' },
        jquery: {exports: '$'},
        react: {exports: 'React'}
    },
    map: {
        '*': {
            'react/addons': 'react'
        }
    }
});

requirejs(['jquery', 'react', 'fiddle', 'bootstrap'], function ($, React, fiddle) {
    'use strict';
    var elem = React.createElement(fiddle);
    window.fiddle = React.render(elem, document.getElementById('container'));
    //$(function () {
    //    //$(window).resize(calcSize);
    //    //calcSize();
    //});
    //
    //function calcSize() {
    //    var contentHeight = $(window).height() - $('#header').height();
    //    var height = contentHeight / 2 - 10;
    //    console.log(contentHeight, height);
    //    $('.code-area').each(function (/*i, k*/) {
    //        $(this).height(height);
    //        console.log($(this).height());
    //    });
    //    window.editorCode.refresh();
    //    window.editorRT.refresh();
    //    window.editorGenerated.refresh();
    //}
});

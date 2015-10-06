/*eslint semi:0,no-unused-expressions:0,no-extra-parens:0,strict:0*/
({
    baseUrl: 'playground',
    //name: 'node_modules/almond/almond.js', // assumes a production build using almond
    out: 'playground/dist/home.min.js',
    include: ['home-main.js'],
    paths: {
        lodash: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash',
        jquery: '//code.jquery.com/jquery-1.11.0.min',
        firebase: '//cdn.firebase.com/js/client/2.0.5/firebase',
        react: '//cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react-with-addons',
        //ace: '../ace-builds-1.1.8/src-min/ace',
        fiddle: './fiddle',
        text: 'libs/requirejs-plugins/text',
        json: 'libs/requirejs-plugins/json'
    },
    shim: {
        lodash: {exports: '_'},
        firebase: {exports: 'Firebase'},
        jquery: {exports: '$'},
        react: {exports: 'React'}
    },
    map: {
        '*': {
            'react/addons': 'react'
        }
    }
})

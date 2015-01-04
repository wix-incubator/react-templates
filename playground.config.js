({
    baseUrl: 'playground',
    //name: 'node_modules/almond/almond.js', // assumes a production build using almond
    out: 'playground/dist/fiddle.min.js',
    include: ['fiddle-main.js'],
    paths: {
        lodash: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash',
        jquery: '//code.jquery.com/jquery-1.11.0.min',
        firebase: '//cdn.firebase.com/js/client/2.0.5/firebase',
        react: '//fb.me/react-with-addons-0.12.1',
        //ace: '../ace-builds-1.1.8/src-min/ace',
        fiddle: './fiddle',
        text: 'libs/requirejs-plugins/text',
        json: 'libs/requirejs-plugins/json',
        bootstrap: 'libs/bootstrap/bootstrap.min'
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

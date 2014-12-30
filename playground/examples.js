'use strict';
define(['lodash', 'react', './examples.rt',
        'text!./samples/hello.code', 'text!./samples/hello.rt',
        'text!./samples/todo.code', 'text!./samples/todo.rt',
        'text!./samples/rt-if.code', 'text!./samples/rt-if.rt',
        'text!./samples/rt-props.code', 'text!./samples/rt-props.rt',
        'text!./samples/rt-repeat.code', 'text!./samples/rt-repeat.rt',
        'text!./samples/weather.code', 'text!./samples/weather.rt'
], function (_, React, examplesTemplate, helloCode, helloRT, todoCode, todoRT, rtIfCode, rtIfRT, rtPropsCode, rtPropsRT, rtRepeatCode, rtRepeatRT, weatherCode, weatherRT) {
    var samples = {
        hello: [helloCode, helloRT],
        todo: [todoCode, todoRT],
        props: [rtPropsCode, rtPropsRT],
        rtIf: [rtIfCode, rtIfRT],
        repeat: [rtRepeatCode, rtRepeatRT],
        weather: [weatherCode, weatherRT]
    };
    //samples = _.map(samples, function (tuple) {
    //    return {templateProps: tuple[0], templateHTML: tuple[1]};
    //});
    Object.keys(samples).forEach(function (k) {
        samples[k] = {name: k, templateProps: samples[k][0], templateHTML: samples[k][1]};
    });

    var Examples = React.createClass({
        displayName: 'Examples',
        mixins: [React.addons.LinkedStateMixin],

        getInitialState: function () {
            return {
                samples: samples
            };
        },

        render: function () {
            return examplesTemplate.apply(this);
        }
    });

    return Examples;
});

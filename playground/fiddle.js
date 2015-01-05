/**
 * Created by avim on 12/2/2014.
 */
/*eslint global-strict:0, no-alert:0*/
/*global alert:true*/
define(['react', 'firebase', 'lodash', './fiddle.rt', 'jquery'], function (React, Firebase, _, fiddleTemplate, $) {
    'use strict';

    function generateRandomId() {
        var uuid = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = _.random(0, 15);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    var Fiddle = React.createClass({
        displayName: 'Fiddle',
        componentDidMount: function () {
            if (window.location.hash) {
                var newHash = window.location.hash.replace('#', '');
                var firebase = new Firebase('https://reacttemplates.firebaseio-demo.com/');
                firebase.child('fiddles').child(newHash).on('value', function (snapshot) {
                    this.refs.playground.setState(snapshot.val());
                    Firebase.goOffline();
                }.bind(this));
            } else {
                Firebase.goOffline();
            }
        },
        save: function () {
            var newHash = generateRandomId();
            window.location.hash = newHash;
            Firebase.goOnline();

            var playgroundState = this.refs.playground.state;
            var firebase = new Firebase('https://reacttemplates.firebaseio-demo.com/');
            firebase.child('fiddles').child(newHash).set(playgroundState, function () {
                Firebase.goOffline();
                alert('saved the fiddle, you can share your url');
            }/*.bind(this)*/);
        },
        clear: function () {
            this.refs.playground.clear();
        },
        loadSample: function (name) {
            //require(['text!./samples/' + name + '.rt', 'text!./samples/' + name + '.code'], function (rt, code) {
            //    var currentState = {
            //        templateHTML: rt,
            //        templateProps: code
            //    };
            //    //this.updateSample(currentState);
            //    this.refs.playground.setState(currentState);
            //});

            var playground = this.refs.playground;
            $.get('playground/samples/' + name + '.rt', null, function (data/*, textStatus, jqXHR*/) {
                var rt = data;
                $.get('playground/samples/' + name + '.code', null, function (data2/*, textStatus2, jqXHR2*/) {
                    var currentState = {
                        templateHTML: rt,
                        templateProps: _.template(data2, {name: 'template'})
                    };
                    //this.updateSample(currentState);
                    playground.setState(currentState);
                });
            });
            //this.refs.playground.clear();
        },
        render: fiddleTemplate
    });

    return Fiddle;
});





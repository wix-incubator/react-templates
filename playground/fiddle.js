/**
 * Created by avim on 12/2/2014.
 */
var React = require('react/addons');
var _ = require('lodash');
var fiddleTemplate = require('./fiddle.rt.js');

function generateRandomId() {
    var uuid = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = _.random(0, 15);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

var Fiddle = React.createClass({
    displayName: "Fiddle",
    componentDidMount: function () {
        if (window.location.hash) {
            var newHash = window.location.hash.replace("#", "");
            var firebase = new Firebase('https://reacttemplates.firebaseio-demo.com/');
            firebase.child("fiddles").child(newHash).on('value', function (snapshot) {
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
        firebase.child("fiddles").child(newHash).set(playgroundState, function () {
            Firebase.goOffline();
            alert("saved the fiddle, you can share your url")
        }.bind(this));

    },

    render: function () {
        return fiddleTemplate.apply(this);
    }
});

module.exports = Fiddle;





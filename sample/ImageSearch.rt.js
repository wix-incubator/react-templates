define([
    'react',
    'lodash',
    'InfiniteScroll'
], function (React, _, InfiniteScroll) {
    'use strict';
    function onKeyDown1(e) {
        if (e.keyCode == 13) {
            this.search();
            return false;
        }
    }
    function onClick2() {
        this.search();
        return false;
    }
    function repeatI3(row, rowIndex, i, iIndex) {
        return React.DOM.a({
            'href': i.originalContext,
            'target': 'blank',
            'className': 'container fadeInDown',
            'key': i.id
        }, React.DOM.div({
            'style': {
                paddingTop: Math.floor(100 / i.ratio) + '%',
                backgroundColor: 'grey'
            }
        }), React.DOM.div({ 'className': 'imgContainer' }, React.DOM.img({
            'width': '100%',
            'src': i.url
        }), React.DOM.div({ 'className': 'title' }, i.title)));
    }
    function repeatRow4(row, rowIndex) {
        return React.DOM.div.apply(this, _.flatten([
            { 'key': row },
            _.map(this.state.items[row], repeatI3.bind(this, row, rowIndex))
        ]));
    }
    return function () {
        return React.DOM.div({ 'className': 'innerContainer' }, React.DOM.div({ 'className': 'searchbox' }, React.DOM.input({
            'type': 'text',
            'valueLink': this.linkState('searchTerm'),
            'onKeyDown': onKeyDown1.bind(this)
        }), React.DOM.button({ 'onClick': onClick2.bind(this) }, 'Search')), InfiniteScroll.apply(this, _.flatten([
            {
                'className': 'fixed',
                'onLoadMore': this.loadMore,
                'threshold': 150
            },
            _.map([
                0,
                1,
                2
            ], repeatRow4.bind(this))
        ])));
    };
});
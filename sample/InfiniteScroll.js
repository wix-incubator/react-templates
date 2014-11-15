define([
    'lodash',
    'jquery',
    'react'
], function (_, $, React) {
    'use strict';

    var InfiniteScroll = React.createClass({

        displayName: 'InfiniteScroll',
        gettingMore: false,

        onLoadMoreFinished: function() {
            this.gettingMore = false;
        },

        onScroll: function(evt) {
            if (!this.props.onLoadMore || this.gettingMore) {
                return;
            }
            var threshold = this.props.threshold || 0;
            var raw = evt.target;
            if (raw.scrollTop + raw.offsetHeight + threshold >= raw.scrollHeight) {
                this.gettingMore = true;
                this.props.onLoadMore(this.onLoadMoreFinished);
            }
        },

        render: function () {
            var passedProps = _.omit(this.props, ['onLoadMore', 'threshold', 'children', 'onScroll']);
            passedProps.onScroll = this.onScroll;
            return React.DOM.div(passedProps, this.props.children);
        }
    });

    return InfiniteScroll;
});

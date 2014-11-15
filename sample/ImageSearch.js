define([
    'lodash',
    'jquery',
    'react',
    'ImageSearch.rt'
], function (_, $, React, template) {
    'use strict';

    var ImageSearch = React.createClass({

        displayName: 'ImageSearch',
        mixins: [React.addons.LinkedStateMixin],

        seq: 0,
        total: 0,
        hasMore: true,
        heights: [0, 0, 0],
        realTerm: 'cats',

        getInitialState: function () {
            setTimeout(this.search, 0);
            return {
                searchTerm: this.realTerm,
                items: [[], [], []]
            };
        },

        search: function() {
            this.state.items = [[], [], []];
            this.total = 0;
            this.heights = [0, 0, 0];
            this.hasMore = true;
            this.realTerm = this.state.searchTerm;
            this.loadMore();
        },

        indexOfMin: function(array) {
            var indexAndMin = _.reduce(array, function(accum, height, index) {
                return (height < accum.min) ? { i: index, min: height } : accum;
            }, {i: -1, min: Number.MAX_VALUE});
            return indexAndMin.i;
        },

        loadMore: function(done) {
            done = done || function() {};
            if (!this.hasMore) {
                done();
                return;
            }
            var url = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&rsz=8&start=' + this.total + '&q=' + this.realTerm + "&callback=?";

            var self = this;
            $.ajax({url: url, dataType: 'jsonp'})
                .done(function(data){
                    if (!data.responseData) {
                        self.hasMore = false;
                        done();
                        return;
                    }
                    var results = data.responseData.results;

                    var items = _.cloneDeep(self.state.items);

                    for (var i = 0; i < results.length; i++) {
                        var result = data.responseData.results[i];
                        var minHeightIndex = self.indexOfMin(self.heights);

                        items[minHeightIndex].push({
                            id: self.seq + 1,
                            title: result.titleNoFormatting,
                            url: result.url,
                            ratio: result.width / result.height,
                            originalContext: result.originalContextUrl
                        });

                        var relativeHeight = result.height / result.width;
                        self.heights[minHeightIndex] = self.heights[minHeightIndex] + relativeHeight;
                        self.total++;
                        self.seq++;
                    }
                    self.setState({items: items});
                    done();
                });
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            return !_.isEqual(this.state, nextState);
        },

        render: function () {
            return template.apply(this);
        }
    });

    return ImageSearch;
});
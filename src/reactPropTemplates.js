'use strict';

var native = {
    '0.9.0': {
        ListView: {
            Row: {prop: 'renderRow', arguments: ['rowData', 'sectionID', 'rowID', 'highlightRow']},
            Footer: {prop: 'renderFooter', arguments: []},
            Header: {prop: 'renderHeader', arguments: []},
            ScrollComponent: {prop: 'renderScrollComponent', arguments: ['props']},
            SectionHeader: {prop: 'renderSectionHeader', arguments: ['sectionData', 'sectionID']},
            Separator: {prop: 'renderSeparator', arguments: ['sectionID', 'rowID', 'adjacentRowHighlighted']}
        }
    }
};

module.exports = {
    native: native,
    dom: {}
};
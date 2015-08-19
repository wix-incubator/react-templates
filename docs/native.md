# React Template for Native Apps

In order to use React Templates for [React Native](https://facebook.github.io/react-native/) you should set the `native` option to true.
In native mode the default `modules` option is set to `commonjs`.

## Default properties templates configuration

In native mode we define a default properties template configuration in order to easily write native templates.

```json
 {
     ListView: {
         Row: {prop: 'renderRow', arguments: ['rowData', 'sectionID', 'rowID', 'highlightRow']},
         Footer: {prop: 'renderFooter', arguments: []},
         Header: {prop: 'renderHeader', arguments: []},
         ScrollComponent: {prop: 'renderScrollComponent', arguments: ['props']},
         SectionHeader: {prop: 'renderSectionHeader', arguments: ['sectionData', 'sectionID']},
         Separator: {prop: 'renderSeparator', arguments: ['sectionID', 'rowID', 'adjacentRowHighlighted']}
     }
 }
```

With this configuration you can write your ListView component as follow:

##### With default arguments:

```html
<View>
    <ListView dataSource="{this.state.dataSource}">
        <Row>
            <Text>{rowData}</Text>
        </Row>
    </ListView>
</View>
```

###### Compiled:
```javascript
'use strict';
var React = require('react-native');
var _ = require('lodash');
function renderRow1(rowData) {
    return React.createElement(React.Text, {}, rowData);
}
module.exports = function () {
    return React.createElement(React.View, {}, React.createElement(React.ListView, {
        'dataSource': this.state.dataSource,
        'renderRow': renderRow1.bind(this)
    }));
};
```

##### With custom arguments:

```html
<View>
    <ListView dataSource="{this.state.dataSource}">
        <Row arguments="item">
            <Text>{item}</Text>
        </Row>
    </ListView>
</View>
```

###### Compiled:
```javascript
'use strict';
var React = require('react-native');
var _ = require('lodash');
function renderRow1(item) {
    return React.createElement(React.Text, {}, item);
}
module.exports = function () {
    return React.createElement(React.View, {}, React.createElement(React.ListView, {
        'dataSource': this.state.dataSource,
        'renderRow': renderRow1.bind(this)
    }));
};
```


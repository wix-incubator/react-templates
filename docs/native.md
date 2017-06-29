# React Templates for Native Apps

In order to use React Templates for [React Native](https://facebook.github.io/react-native/) you should set the `native` option to true.
In native mode the default `modules` option is set to `commonjs` and the default `react-import-path` is set to `react-native`.

## Default properties templates configuration

In native mode we define a default properties template configuration in order to easily write native templates.

```javascript
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

## Native style support

This feature is **Experimental** and is subject to change.

You can use rt to compile a style file similar to css:

```
.text {
    background-color: #00346E;
    padding: 3px;
}

.fonts {
    background-color: #000099;
    height: 30px;
}
```

will result in:

```javascript
'use strict';
var style = {
  "text": {
    "backgroundColor": "#00346E",
    "padding": 3
  },
  "fonts": {
    "backgroundColor": "#000099",
    "height": 30
  }
};
module.exports = style;
```

Which later you can import in your react native component:

```javascript
var styles = StyleSheet.create(require('./style.rts'))
```




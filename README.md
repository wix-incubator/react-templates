[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

# React Templates

Lightweight templates for [React](http://facebook.github.io/react/index.html). 

* No runtime libraries. No magic. Simply precompile your way to clear React code.
* Easy syntax that's similar to HTML, supported by most IDEs.
* Clear separation of presentation and logic - almost zero HTML in component files.
* Declarative coding ensures that the HTML that you write and the HTML you inspect look nearly identical.
* Supports AMD, CommonJS, ES6, Typescript and globals.

## How does it work
React Templates compiles an *.rt file (react template file - an extended HTML format) into a JavaScript file. This file, which uses AMD syntax, returns a function. When invoked, this function returns a virtual React DOM based on React.DOM elements and custom user components. 
<p>A common use case would be that a regular React component would require a JavaScript file generated from a template, and then perform `func.apply(this)`, causing the template to have that component as its context.

## Playground
http://wix.github.io/react-templates/

## Yeoman generator
https://github.com/wix/generator-react-templates

## Hello react-templates
Here's a sample Hello project:<br/>
https://github.com/wix/hello-react-templates

## IntelliJ / WebStorm plugin
http://plugins.jetbrains.com/plugin/7648


###### Basic concepts for React templates
* Any valid HTML (including comments) is a template 
* {} to identify JS expression
* Built-in directives:
    * [rt-if](#rt-if)
    * [rt-repeat](#rt-repeat)
    * [rt-scope](#rt-scope)
    * [rt-props](#rt-props)
    * [rt-class](#rt-class)
    * [rt-require](#rt-require)
* [styles](#styles)
* [event handlers](#event-handlers)

###### Why not use JSX?
Some love JSX, some don't. We don't. More specifically, it seems to us that JSX is only a good fit for components with very little HTML inside. And this can be accomplished by creating DOM elements in code. Also, we like to separate code and HTML because it just feels right.

## Installation
You can install react-templates using npm:
```shell
npm install react-templates -g
```

## Usage
```shell
rt [file.rt|dir]* [options]
```

See more on CLI usage [here](https://github.com/wix/react-templates/blob/gh-pages/docs/cli.md).

In most cases, this package will be wrapped in a build task, so CLI will not be used explicitly:
* Grunt: [grunt-react-templates](https://github.com/wix/grunt-react-templates)
* Gulp: [gulp-react-templates](https://github.com/wix/gulp-react-templates)
* Broccoli: [broccoli-react-templates](https://github.com/kraftwer1/broccoli-react-templates)
* Browserify plugin: [react-templatify](https://www.npmjs.com/package/react-templatify)

# Template directives and syntax

## Any valid HTML is a template
Any HTML that you write is a valid template, except for inline event handlers ("on" attributes). See the "event handlers" section below for more information.

## {} to identify JavaScript expressions
To embed JavaScript expressions in both attribute values and tag content, encapsulate them in {}. If this is done inside an attribute value, the value still needs to be wrapped in quotes. For directives (see below), {} are not used.

###### Sample:
```html
<a href="{this.state.linkRef}">{this.state.linkText}</a>
```
###### Compiled:
```javascript
define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        return React.DOM.a({ 'href': this.state.linkRef }, this.state.linkText);
    };
});
```

## rt-if
This lets you add conditions to a subtree of HTML. If the condition evaluates to true, the subtree will be returned; otherwise, it will not be calculated. It is implemented as a ternary expression.


###### Sample:
```html
<div rt-if="this.state.resultCode === 200">Success!</div>
```
###### Compiled:
```javascript
define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        return this.state.resultCode === 200 ? React.DOM.div({}, 'Success!') : null;
    };
});
```

## rt-repeat
Repeats a DOM node with its subtree for each item in an array. The syntax is `rt-repeat="itemVar in arrayExpr"`, where the element, `itemVar`, will be available in JavaScript context, and an `itemVarIndex` will be created to represent the index of the item. By using this naming scheme, repeated expressions have access to all levels of nesting.

###### Sample:
```html
<div rt-repeat="myNum in this.getMyNumbers()">{myNumIndex}. {myNum}</div>
```
###### Compiled:
```javascript
define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    function repeatMyNum1(myNum, myNumIndex) {
        return React.DOM.div({}, myNumIndex + '. ' + myNum);
    }
    return function () {
        return _.map(this.getMyNumbers(), repeatMyNum1.bind(this));
    };
});
```

## rt-scope
This directive creates a new JavaScript scope by creating a new method and invoking it with its current context. The syntax is `rt-scope="expr1 as var1; expr2 as var2`. This allows for a convenient shorthand to make the code more readable. It also helps to execute an expression only once per scope.

###### Sample:
```html
<div rt-repeat="rpt in array">
    <div rt-scope="')' as separator; rpt.val as val">{rptIndex}{separator} {val}</div>
    <div>'rpt' exists here, but not 'separator' and 'val'</div>
</div>
```
###### Compiled:
```javascript
define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    function scopeSeparatorVal1(rpt, rptIndex, separator, val) {
        return React.DOM.div({}, rptIndex + separator + ' ' + val);
    }
    function repeatRpt2(rpt, rptIndex) {
        return React.DOM.div({}, scopeSeparatorVal1.apply(this, [
            rpt,
            rptIndex,
            ')',
            rpt.val
        ]), React.DOM.div({}, '\'rpt\' exists here, but not \'separator\' and \'val\''));
    }
    return function () {
        return _.map(array, repeatRpt2.bind(this));
    };
});
```

## rt-props
rt-props is used to inject properties into an element programmatically. It will merge the properties with the properties received in the template. This option allows you to build properties based on external logic and pass them to the template. It is also useful when passing properties set on the component to an element within the template. The expected value of this attribute is an expression returning an object. The keys will be the property name, and the values will be the property values.

###### Sample:
```html
<input style="height:10px;width:3px;" rt-props="{style:{width:'5px'},type:'text'}"/>
```
###### Compiled:
```javascript
define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        return React.DOM.input(_.merge({}, {
            'style': {
                height: '10px',
                width: '3px'
            }
        }, {
            style: { width: '5px' },
            type: 'text'
        }));
    };
});
```

## rt-class
To reduce the boilerplate code when setting class names programatically, you can use the rt-class directive. It expects a JSON object with keys as class names, and a Boolean as the value. If the value is true, the class name will be included.

<p>Note the following:<br/>
1. In React templates, you can use the "class" attribute as you would in HTML. <br/>
2. You cannot use class and rt-class on the same HTML element.

###### Sample:
```html
<div rt-scope="{blue: true, selected: this.isSelected()} as classes">
    These are logically equivalent
    <div rt-class="classes">Reference</div>
    <div rt-class="{blue: true, selected: this.isSelected()}">Inline</div>
    <div class="blue{this.isSelected() ? ' selected' : ''}">Using the class attribute</div>
</div>
```
###### Compiled:
```javascript
define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    function scopeClasses1(classes) {
        return React.DOM.div({}, 'These are logically equivalent', React.DOM.div({ 'className': React.addons.classSet(classes) }, 'Reference'), React.DOM.div({
            'className': React.addons.classSet({
                blue: true,
                selected: this.isSelected()
            })
        }, 'Inline'), React.DOM.div({ 'className': 'blue' + this.isSelected() ? ' selected' : '' }, 'Using the class attribute'));
    }
    return function () {
        return scopeClasses1.apply(this, [{
                blue: true,
                selected: this.isSelected()
            }]);
    };
});
```

## style
React templates allow the settings of styles inline in HTML, optionally returning an object from the evaluation context. By default, style names will be converted from hyphen-style to camelCase-style naming. 

To embed JavaScript inside a style attribute, single curly braces are used. To embed an entire object, double curly braces are used. *Note*: When embedding objects, styles must conform to camelCase-style naming.

###### Sample:
```html
<div>
    These are really equivalent
    <div style="color:white; line-height:{this.state.lineHeight}px">Inline</div>
    <div style="{{'color': 'white', 'lineHeight': this.state.lineHeight + 'px'}}">Inline</div>
</div>
```
###### Compiled:
```javascript
define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        return React.DOM.div({}, 'These are really equivalent', React.DOM.div({
            'style': {
                color: 'white',
                lineHeight: this.state.lineHeight + 'px'
            }
        }, 'Inline'), React.DOM.div({
            'style': {
                'color': 'white',
                'lineHeight': this.state.lineHeight + 'px'
            }
        }, 'Inline'));
    };
});
```

## event handlers
React event handlers accept function references inside of {}, such as `onClick="{this.myClickHandler}"`. When functions are not needed, lambda notation can be used, which will create a React template that creates a function for the included code. There is no performance impact, as the function created is bound to the context instead of being recreated. 
<p>The lambda notation has the form: `onClick="(evt) => console.log(evt)"`. In this example, **evt** is the name of the first argument passed into the inline function. With browser events, this will most likely be the React synthetic event. However, if you expect a property that starts with **on**Something, then React templates will treat it as an event handler. If you have an event handler called **onBoxSelected** that triggers an event with row and column params, you can write `onBoxSelected="(row, col)=>this.doSomething(row,col)"`. A no-param version is supported as well: `onClick="()=>console.log('just wanted to know it clicked')"`.

###### Sample:
```html
<div rt-repeat="item in items">
    <div onClick="()=>this.itemSelected(item)" onMouseDown="{this.mouseDownHandler}">
</div>
```
###### Compiled:
```javascript
define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    function onClick1(item, itemIndex) {
        this.itemSelected(item);
    }
    function repeatItem2(item, itemIndex) {
        return React.DOM.div({}, React.DOM.div({
            'onClick': onClick1.bind(this, item, itemIndex),
            'onMouseDown': this.mouseDownHandler
        }));
    }
    return function () {
        return _.map(items, repeatItem2.bind(this));
    };
});
```

## rt-require, and using other components in the template
In many cases, you'd like to use either external code or other components within your template. An **rt-require** tag lets you include dependencies: `<rt-require dependency="depVarPath" as="depVarName"/>`. Once included, **depVarName** will be in scope. You can only use rt-require tags at the beginning of your template. When including React components, they can be referred to by their tag name inside a template. For example, `<MySlider prop1="val1" onMyChange="{this.onSliderMoved}">`. Nesting is also supported: `<MyContainer><div>child</div><div>another</div></MyContainer>`. Children are accessible from **this.props.children**.

###### Sample:
```html
<rt-require dependency="comps/myComp" as="MyComp"/>
<rt-require dependency="utils/utils" as="utils"/>
<MyComp rt-repeat="item in items">
    <div>{utils.toLower(item.name)}</div>
</MyComp>
```
###### Compiled (AMD):
```javascript
define([
    'react/addons',
    'lodash',
    'comps/myComp',
    'utils/utils'
], function (React, _, MyComp, utils) {
    'use strict';
    function repeatItem1(item, itemIndex) {
        return React.createElement(MyComp, {}, React.createElement('div', {}, utils.toLower(item.name)));
    }
    return function () {
        return _.map(items, repeatItem1.bind(this));
    };
});
```
###### Compiled (with CommonJS flag):
```javascript
var React = require('react/addons');
var _ = require('lodash');
var MyComp = require('comps/myComp');
var utils = require('utils/utils');
'use strict';
function repeatItem1(item, itemIndex) {
    return React.createElement(MyComp, {}, React.createElement('div', {}, utils.toLower(item.name)));
}
module.exports = function () {
    return _.map(items, repeatItem1.bind(this));
};
```
###### Compiled (with ES6 flag):
```javascript
import { React } from 'react/addons';
import { _ } from 'lodash';
import { MyComp } from 'comps/myComp';
import { utils } from 'utils/utils';
function repeatItem1(item, itemIndex) {
    return React.createElement(MyComp, {}, React.createElement('div', {}, utils.toLower(item.name)));
}
export default function () {
    return _.map(items, repeatItem1.bind(this));
};
```

## License
Copyright (c) 2014 Wix. Licensed under the MIT license.

[npm-image]: https://img.shields.io/npm/v/react-templates.svg?style=flat-square
[npm-url]: https://npmjs.org/package/react-templates
[travis-image]: https://img.shields.io/travis/wix/react-templates/gh-pages.svg?style=flat-square
[travis-url]: https://travis-ci.org/wix/react-templates
[coveralls-image]: https://img.shields.io/coveralls/wix/react-templates/gh-pages.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/wix/react-templates?branch=gh-pages
[downloads-image]: http://img.shields.io/npm/dm/react-templates.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/react-templates

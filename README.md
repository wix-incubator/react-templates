[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]

# React Templates

Lightweight templates for [React](http://facebook.github.io/react/index.html). 

* No runtime libraries. No magic. Simply precompile your way to clear React code.
* It's super easy to write panels - components that have a lot of HTML code and non-reusable logic.
* There's very good separation of presentation and logic - that is, there's almost no HTML within the component file.
* Declarative coding for presentation makes the HTML that you write and inspect look similar.
* Easy syntax that's similar to HTML. All IDEs recognize this format.
* Supports AMD, CommonJS, and globals.

## How does it work
React templates compiles a *.rt file (react template file - an extended HTML format) into a JavaScript file. This file, which currently utilizes RequireJS format, returns a function. When invoked, this function returns a virtual React DOM (based on React.DOM elements and custom user components). 
<p>A common use case would be that a regular React component would require a JavaScript file generated from a template, and then perform `func.apply(this)`, causing the template to have that component as its context.

## Playground
http://wix.github.io/react-templates/

## Yeoman generator
https://github.com/wix/generator-react-templates

## Hello react-templates
Here's a sample Hello project:<br/>
https://github.com/wix/hello-react-templates



###### Basic concepts for React templates
* Any valid HTML (including comments) is a template 
* {} to identify JS expression
* rt-if
* rt-repeat
* rt-scope
* rt-props
* rt-class
* style
* event handlers
* rt-require, and using other components in the template

###### Why not use JSX?
Some love JSX, some don't. We don't. More specifically, it seems to us that JSX is only a good fit for components with very little HTML inside, which can be accomplished instead by creating elements in code. Also, we like to separate code and HTML - it just feels right.

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

In most cases, this package will be wrapped in a Grunt task, so that CLI will not be used explicitly:
[grunt-react-templates](https://github.com/wix/grunt-react-templates).

# Template directives and syntax

## Any valid HTML is a template
Any HTML that you write is a valid template, except for inline event handlers ("on" attributes). See the "event handlers" section for more information.

## {} to identify JavaScript expressions
You can easily embed JavaScript expressions in both attribute values and content by encapsulating them in {}. If this is done inside an attribute value, the value still needs to be wrapped in quotes. In tag content, you can just use it.

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
*Note*: within the special **"rt-"** directives (see below), simple strings don't make sense, as all these directives are used for specifying execution instructions. Therefore, in these directives, you should not use {}.

## rt-if
This lets you add conditions to a subtree of HTML. If the condition evaluates to true, the subtree will be returned; otherwise, it will not be calculated. It is implemented by a trinary expression.


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
Repeats a node with its subtree for each item in an array. To implement, create a method that is passed to a map call as a callback, which creates a real context for the iterated variable. The syntax is `rt-repeat="itemVar in arrayExpr"`. Within the scope of the element, `itemVar` will be available in JavaScript context, and an `itemVarIndex` will also be created to represent the index of the item. If the definition is `myNum in this.getMyNumbers()`, then there will be 2 variables in the scope: `myNum` and `myNumIndex`. This naming gives repeat expressions access to all levels of nesting.

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
rt-props is used to inject properties into an element programmatically. It will merge the properties with the properties received in the template. This option allows the code writer to build properties based on some app logic and pass them to the template. It is also useful when passing properties set on the component to an element within the template. The expected value of this attribute is an expression returning an object. The keys will be the properties, and the values will be the property values.

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
To reduce the boilerplate code when setting class names programatically, you can use the rt-class directive. It expects to get a JSON object with keys as class names, and true or false as the value. If the value is true, the class name will be included.

<p>Note the following:<br/>
1. In React templates, you can use the "class" attribute as you would in HTML. You can even have execution context within it.<br/>
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
To make React templates more similar to HTML, we allow the settings of inline styles. This will change the styles from hyphen to camelCase. And you can still return an object from evaluation context. Please note that if you set inline styles, you'll need to open single curly braces for the js context, and another for the object. You'll also need to use camelCase.

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
React event handlers accept function pointers. Therefore, when using event handlers, you can just open an execution context and provide a pointer to a method. This would look like `onClick="{this.myClickHandler}"`. However, sometimes there's very little to do on click, or we just want to call a method with bound parameters. In that case, you can use lambda notation, which will create a React template that creates a method for the handler. It does not have a performance impact, as the method is created once and is bound to the context instead of being created again. 
<p>The lambda notation will look like this: `onClick="(evt) => console.log(evt)"`. In this example, **evt** was the name you chose for the first argument that will be passed into your inline method. With browser events, this will most likely be the React synthetic event. However, if you expect a property that starts with **on**Something, then React templates will treat it as an event handler. So if you have an event handler called **onBoxSelected** that will trigger an event with row and column params, you can write `onBoxSelected="(row, col)=>this.doSomething(row,col)"`. You can use a no-param version as well: `onClick="()=>console.log('just wanted to know it clicked')"`.

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
In many cases, you'd like to use either library code or other components within your template. To do so, you can define a **rt-require** tag and indicate dependencies: `<rt-require dependency="depVarPath" as="depVarName"/>`. After that, you will have **depVarName** in your scope. You can only use rt-require tags in the beginning of your template. You can import React components and use them afterwards in the template as tag names. For example, `<MySlider prop1="val1" onMyChange="{this.onSliderMoved}">`. This will also support nesting: `<MyContainer><div>child</div><div>another</div></MyContainer>`. You will then be able to find the children in **this.props.children**.

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

## License
Copyright (c) 2014 Wix. Licensed under the MIT license.

[npm-image]: https://img.shields.io/npm/v/react-templates.svg?style=flat-square
[npm-url]: https://npmjs.org/package/react-templates
[travis-image]: https://img.shields.io/travis/wix/react-templates/gh-pages.svg?style=flat-square
[travis-url]: https://travis-ci.org/wix/react-templates
[coveralls-image]: https://img.shields.io/coveralls/wix/react-templates/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/wix/react-templates?branch=master
[downloads-image]: http://img.shields.io/npm/dm/react-templates.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/react-templates

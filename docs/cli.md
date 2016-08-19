# Command line Interface

## Installation
```shell
npm install react-templates -g
```

## Usage
```shell
rt [file.rt|dir]* [options]
```

Such as:
```shell
rt dir/file.rt
```

## Options

The command line utility has several options. You can view the options by running `rt -h`.
```
Usage:
$ rt <filename> [<filename> ...] [<args>]

Options:
  -h, --help                   Show help.
  -c, --color                  Use colors in output. - default: true
  -m, --modules String         Use output modules. (amd|commonjs|none|es6|typescript|jsrt) - either: amd, commonjs, none, es6, typescript, or jsrt
  -n, --name String            When using globals, the name for the variable. The default is the [file name]RT, when using amd, the name of the module
  -d, --dry-run                Run compilation without creating an output file, used to check if the file is valid - default: false
  -r, --force                  Force creation of output. skip file check. - default: false
  -f, --format String          Use a specific output format. (stylish|json) - default: stylish
  -t, --target-version String  'React version to generate code for (15.0.1, 15.0.0, 0.14.0, 0.13.1, 0.12.2, 0.12.1, 0.12.0, 0.11.2, 0.11.1, 0.11.0, 0.10.0, default)' - default: 0.14.0
  --list-target-version        Show list of target versions - default: false
  -v, --version                Outputs the version number.
  -k, --stack                  Show stack trace on errors.
  --react-import-path String   Dependency path for importing React.
  --lodash-import-path String  Dependency path for importing lodash. - default: lodash
  --native, --rn               Renders react native templates.
  --flow                       Add /* @flow */ to the top of the generated file
  --native-target-version, --rnv String  React native version to generate code for (0.9.0, 0.29.0, default) - either: 0.9.0, 0.29.0, or default - default: 0.9.0
  --normalize-html-whitespace  Remove repeating whitespace from HTML text. - default: false
  --create-element-alias       Use an alias name for "React.createElement()"
  --external-helpers           Emit helper functions as external dependency (and do not rely on 'lodash').
```

### `-h`, `--help`

This option outputs the help menu, displaying all of the available options. All other flags are ignored when this is present.

### `-c`, `--color`

The option enable or disable color in the output.

### `-m`, `--modules`

Use output modules. Valid targets are: `amd`, `commonjs`, `none`, `es6`, `typescript`, or `jsrt`.

### `-n`, `--name`

When using globals, the name for the variable. The default is the [file name]RT, when using amd, the name of the module.

### `-d`, `--dry-run`

Run compilation without creating an output file, used to check if the file is valid - default: false

### `-r`, `--force`

This option allows to override the output file even if there are no changes.

### `-f`, `--format`

Use a specific output format (`stylish` or `json`).

### `-t`, `--target-version`

React version to generate code for (15.0.1, 15.0.0, 0.14.0, 0.13.1, 0.12.2, 0.12.1, 0.12.0, 0.11.2, 0.11.1, 0.11.0, 0.10.0, default). default: 0.14.0

### `--list-target-version`

Show list of target versions.

### `-v`, `--version`

Outputs the version number.

### `-k`, `--stack`

Show stack trace on errors.

### `--react-import-path`

Dependency path for importing React.

### `--lodash-import-path`

Dependency path for importing lodash.

### `--native`, `--rn`

Renders react native templates.

### `--native-target-version`, `--rnv`

React native version to generate code for (0.9.0, 0.29.0, default) - either: 0.9.0, 0.29.0, or default - default: 0.9.0

### `--flow`

Add /* @flow */ to the top of the generated file

### `--normalize-html-whitespace`

Remove repeating whitespace from HTML text.

Repeating whitespaces normally are not displayed and thus can be removed in order to reduce
the size of the generated JavaScript file.

Whitespace removal is not applied on `<pre>` and `<textarea>` tags, or when the special attribute `rt-pre` is specified on a tag.

### `--create-element-alias`

Use an alias name for `React.createElement()`, allowing shorter function calls in the generated JavaScript code.

Example, use `h` instead of `React.createElement()`:
```
rt foo.rt --create-element-alias h
```
will generate:
```
var h = require('react').createElement;
module.exports = function () {
    return h('div', {}, h('span', {}, 'Hello'));
};
```

If using a different library than `React` and the element-creating function is not named `createElement`,
the actual name of the function can be specified by adding a comma after the alias:

Example, use `h` from library `preact`:
```
rt foo.rt --react-import-path preact --create-element-alias h,h
```
will generate:
```
var h = require('preact').h;
module.exports = function () {
    return h('div', {}, h('span', {}, 'Hello'));
};
```

### `--external-helpers`

Specify an external module from where to load the runtime helper functions.

Normally `react-templates` uses `lodash` to perform some utility functions, indeed `lodash`
is the only needed dependency apart from the obvious `react`.

By using `--external-helpers`, the utility functions will not be taken from `lodash` or
embedded in the code, but will be loaded separately as a module, thus allowing
to reduce or fine-tune the dependency from `lodash`.

Example:
```
rt foo.rt --external-helpers react-templates-helpers
```
loads the utility functions from `react-templates-helpers` module (which is the
standard one that falls back on `lodash`).

The specified external module must export the following helper functions:
```
__rtmap(collection, function);  // loops over a collection
__rtclass(object);              // turns a map object into a HTML class-attribute
__rtassign(dest,...objs)        // assign properties to destination object
__rtmergeprops(dest,...objs)    // as above, but considering "style" and "className"
```





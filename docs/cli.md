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
$ rt <filename>[,<filename>] [<args>]

Options:
  -h, --help           Show help.
  -c, --color          Use colors in output. - default: true
  -m, --modules String Use output modules. (amd|commonjs|es6|typescript|none) - default: none
  -r, --force          Force creation of output. skip file check. - default: false
  -f, --format String  Use a specific output format. (stylish|json) - default: stylish
  -t, --target-version String  React version to generate code for (0.12.1, 0.12.0, 0.11.2, 0.11.1, 0.11.0, 0.10.0) - default: 0.12.1
  -v, --version        Outputs the version number.
  -k, --stack          Show stack trace on errors.
```

### `-h`, `--help`

This option outputs the help menu, displaying all of the available options. All other flags are ignored when this is present.

### `-c`, `--color`

The option enable or disable color in the output.

### `-r`, `--force`

This option allows to override the output file even if there are no changes.

### `-m`, `--modules`

Use output modules. (amd|commonjs|es6|typescript|none) - default: none

### `-f`, `--format`

Use a specific output format.

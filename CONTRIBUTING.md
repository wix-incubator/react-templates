# Contributing to React-Templates

Thanks for coming! Contributions of any kind are welcome.

## Setup

* Fork [React-Templates](https://github.com/wix/react-templates)
* Clone your fork
* In your `react-templates` directory, run `npm i && grunt all`

## Submitting an issue

You can submit an issue [here](https://github.com/wix/react-templates/issues).
Please make sure that there isn't already an issue regarding the same matter,
and include as many details as possible about the issue and on how to reproduce it,
if relevant.

## Creating a pull request

* Please adhere to the style and formatting of the code
* Write tests for new functionality
* Create purposeful and complete commits

### Before committing

* Make sure that `grunt all` passes.
* Pick a concise commit message

When working on [wix.github.io/react-templates](http://wix.github.io/react-templates),
run `grunt pgall` to create the minified files,
but do not include their updated version in your commit.
Describe in your PR what you did to the site and we'll update them after the merge.
(This is important for preventing merge conflicts in the minified files).

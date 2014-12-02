'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            main: {
                src: ['playground/**/*.rt.js']
            }
        },
        eslint: {
            all: {
                src: [
                    'src/**/*.js', 'playground/**/*.js',
                    '!playground/main.browser.js',
                    '!playground/bundle/**',
                    '!playground/**/*.rt.js'
                ]
            },
            teamcity: {
                options: {
                    format: 'checkstyle',
                    'output-file': 'target/eslint.xml'
                },
                src: ['<%= eslint.all.src %>']
            }
        },
        jasmine_node: {
            options: {
                forceExit: true,
                match: '.',
                matchall: false,
                specNameMatcher: 'spec',
                extensions: 'js'
            },
            all: ['server/test'],
            grunt: ['conf/tasks/test']
        },
        browserify: {
//            libs: {
//                files: {
//                    'playground/libs.browser.js': ['playground/libs.js']
//                },
//                options: {
//                    alias: [
//                        'react:react/addons'
//                    ],
//                    shim: {
//                        "react/addons": {
//                            path: 'react/addons',
//                            exports: 'React',
//                            depends: {
//                                lodash: '_'
//                            }
//                        },
//                        "../src/reactTemplates": {
//                            path: '../src/reactTemplates.js',
//                            exports: 'reactTemplates',
//                            depends: {
//                                lodash: '_'
//                            }
//                        },
//                        "lodash": {
//                            path: 'lodash',
//                            exports: '_'
//                        },
//                        "brace": {
//                            path: 'brace',
//                            exports: 'brace',
//                            depends: {
//                                lodash: '_'
//                            }
//                        }
//                    }
//
//                }
//            },
            pg: {
                files: {
                    'playground/main.browser.js': ['playground/main.js']
                },
                options: {
                    transform: ['brfs'],
                    alias: [
                        'react:react/addons'
                    ]
//                    exclude:['react','react/addons','../src/reactTemplates','lodash','brace','brace/mode/javascript','brace/mode/html','brace/theme/solarized_light'],
//                    external: [
//                        'react/addons',
//                        '../src/reactTemplates',
//                        'lodash',
//                        'brace'
//                    ]

                }
            }
        },
        node_tap: {
            default_options: {
                options: {
                    outputType: 'tap',
                    outputTo: 'console'
                },
                files: {
                    tests: ['./test/src/*.js']
                }
            }
        },
        watch: {
            rt: {
                files: [
                    'playground/**/*.rt'
                ],
                tasks: ['rt'],
                options: {
                    spawn: false
                }
            },
            playground: {
                files: [
                    'playground/**/*.js'
                ],
                tasks: ['browserify:pg'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-node-tap');

    grunt.registerTask('default', ['eslint']);
    grunt.registerTask('test', ['node_tap']);

    grunt.registerTask('teamcity', ['eslint:teamcity']);

    grunt.registerTask('rt', function () {
        var reactTemplates = require('./src/cli');
        var files = grunt.file.expand('playground/**/*.rt');
        var conf = {commonJS: true, force: true};
        conf._ = files;
        var ret = reactTemplates.executeOptions(conf);
        return ret === 0;
    });

    grunt.registerTask('build', ['rt', 'browserify:pg']);
    grunt.registerTask('home', ['rt', 'browserify:home']);

    grunt.registerTask('all', ['default', 'test']);
};

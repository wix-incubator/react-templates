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
                    '!playground/rt-main.browser.js',
                    '!playground/bundle/**',
                    '!playground/tmp/**',
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
            rt: {
                files: {
                    'playground/rt-main.browser.js': ['playground/rt-main.js']
                },
                options: {
                    transform: ['brfs'],
                    alias: ['react:react/addons']
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
        var files = grunt.file.expand('playground/*.rt');
        var conf = {common: false, force: true, _: files};
        var ret = reactTemplates.execute(conf);
        return ret === 0;
    });

    grunt.registerTask('build', ['rt', 'browserify:pg']);
    grunt.registerTask('home', ['rt', 'browserify:home']);

    grunt.registerTask('all', ['default', 'test']);
};

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
                    '!playground/main.browser.js'
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
            dist: {
                files: {
                    'web/bundle.js': ['web/browser.js']
                }
            },
            pg: {
                files: {
                    'playground/main.browser.js': ['playground/main.js']
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
                    'tests': ['./test/src/*.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-node-tap');

    grunt.registerTask('default', ['eslint', 'build_sources', 'check', 'build']);
    grunt.registerTask('test', ['jasmine_node']);

    grunt.registerTask('teamcity-check', ['eslint:teamcity'/*, 'scsslint'*/]);
    grunt.registerTask('teamcity', ['build_sources', 'teamcity-check', 'packages:teamcity', 'static-upload-to-s3']);
    grunt.registerTask('teamcity-test', ['jasmine_node', 'karma:teamcity', 'cssTest']);

    grunt.registerTask('all', ['install', 'default', 'test']);
};

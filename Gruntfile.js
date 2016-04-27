'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            main: {
                src: ['coverage', 'playground/**/*.rt.js']
            }
        },
        eslint: {
            all: {
                src: [
                    'src/**/*.js', 'playground/**/*.js',
                    'test/src/**/*.js',
                    '!playground/libs/**/*.js',
                    '!playground/dist/**/*.js',
                    '!playground/**/*.rt.js'
                ]
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
                    'playground/dist/rt-main.browser.js': ['playground/rt-main.js']
                },
                options: {
                    transform: ['brfs'],
                    alias: ['react:react/addons']
                }
            }
        },
        tape: {
            options: {
                pretty: true,
                output: 'console'
            },
            files: ['test/src/*.js']
        },
        watch: {
            rt: {
                files: [
                    'playground/*.rt'
                ],
                tasks: ['rt'],
                options: {
                    spawn: false
                }
            },
            test: {
                files: [
                    'src/**/*.*', 'test/**/*.*'
                ],
                tasks: ['test'],
                options: {
                    spawn: false
                }
            }
        },
        uglify: {
            my_target: {
                //options: {
                //    sourceMap: true,
                //    sourceMapIncludeSources: true,
                //    sourceMapIn: 'example/coffeescript-sourcemap.js', // input sourcemap from a previous compilation
                //},
                files: {
                    'playground/dist/rt-main.browser.min.js': ['playground/dist/rt-main.browser.js'],
                    'playground/libs/requirejs-plugins/text.min.js': ['playground/libs/requirejs-plugins/text.js'],
                    'playground/libs/requirejs-plugins/json.min.js': ['playground/libs/requirejs-plugins/json.js']
                }
            }
        },
        requirejs: {
            compile: {
                options: readConfig('./home.config.js')
            },
            playground: {
                options: readConfig('./playground.config.js')
            }
        }
    });

    function readConfig(file) {
        return eval(require('fs').readFileSync(file).toString()); // eslint-disable-line no-eval
    }

    grunt.loadNpmTasks('grunt-tape');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['eslint:all']);
    grunt.registerTask('lint', ['eslint:all']);
    grunt.registerTask('test', ['tape']);

    grunt.registerTask('rt', () => {
        const reactTemplates = require('./src/cli');
        const files = grunt.file.expand('playground/*.rt');
        const ret = reactTemplates.execute({modules: 'amd', force: true, _: files});
        return ret === 0;
    });

    grunt.registerTask('build', ['rt', 'browserify:pg']);
    grunt.registerTask('home', ['rt', 'browserify:home']);
    grunt.registerTask('pgall', ['rt', 'browserify', 'uglify', 'requirejs']);

    grunt.registerTask('all', ['default', 'test']);
};

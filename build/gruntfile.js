/*globals module*/
module.exports = function (grunt) {
    "use strict";
    
    var keypseeFiles = [
            '../src/Callback.js',
            '../src/helpers.js',
            '../src/KeyInfo.js',
            '../src/maps.js',
            '../src/observer.js',
            '../src/PasteObject.js',
            '../src/PasteObserver.js',
            '../src/utils.js',
            '../src/keypseeBootstrapper.js'
        ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        /**
            Watch the JS and LESS folders for changes. Triggering
            fires off the listed tasks
        **/
        watch: {
            js: {
                files: '../src/**/*.js',
                tasks: ["jasmine", "uglify:debug", "uglify:release", "copy:js"],
                options: { nospawn: true, livereload: true, debounceDelay: 250 }
            }
        },
        /**
            Used for production mode, minify and uglyfy the JavaScript Output
        **/
        uglify: {
            debug: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    beautify: true,
                    mangle: false,
                    compress: false,
                    sourceMap: false,
                    drop_console: false,
                    preserveComments: 'some'
                },
                files: {
                    '../release/keypsee.js': keypseeFiles
                }
            },
            release: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
//                    mangle: true,
//                    compress: true,
//                    sourceMap: true,
//                    drop_console: true
                },
                files: {
                    '../release/keypsee.min.js': keypseeFiles
                }
            }
        },
        jasmine: {
            js: {
                src: '../release/keypsee.min.js',
                options: {
                    specs: '../test/specs/*Fixture.js',
                    helpers: '../test/specs/*Helper.js',
                    vendor: [
                        "../lib/node_modules/hilary/release/hilary.min.js",
                        "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"
                    ]
                }
            }
        },
        copy: {
            js: {
                files: [
                    { src: ['../lib/node_modules/hilary/release/hilary.min.js'], dest: '../examples/staticapp/public/scripts/lib/hilary/hilary.min.js', filter: 'isFile' },
                    { src: ['../release/keypsee.js'], dest: '../examples/staticapp/public/scripts/keypsee.js', filter: 'isFile' },
                    { src: ['../release/keypsee.min.js'], dest: '../examples/staticapp/public/scripts/keypsee.min.js', filter: 'isFile' }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('mon', ['watch']);
    grunt.registerTask('default', ["jasmine", "uglify:debug", "uglify:release", "copy:js"]);
    grunt.registerTask('force', ["uglify:debug", "uglify:release", "copy:js"]);

};

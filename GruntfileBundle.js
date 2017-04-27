'use strict'
module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt)
    
    grunt.initConfig({
        config: grunt.file.readJSON("package.json"),
        clean: {
            build: ["dist/"]
        },
        coffee: {
            compile: {
                options: {
                    sourceMap: true,
                },
                files: {
                    'dist/<%= config.name %>.js' : 'coffee/*.coffee' // convert to java-script
                }
            }
        },
        uglify: {
            options: {
                banner: '/*\n<%= config.name %> - v<%= config.version %> - ' +
                        ' <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %> ' + '\n ' + grunt.file.read("copyright.txt") + '\n*/',
                preserveComments: false,
                sourceMap : true,
                sourceMapIn: "dist/<%= config.name %>.js.map"
            },
            build: {
                src: 'dist/<%= config.name %>.js',
                dest: 'dist/<%= config.name %>.min.js'
            }
        }
    });

    grunt.registerTask('bundle', [
        'clean:build',
        'coffee',// Compile CoffeeScript files to JavaScript + map
        'uglify',//min + banner + remove comments + map    
    ]);
};
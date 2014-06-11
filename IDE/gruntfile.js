module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        paths: {
            app: 'app',
            dist: 'build',
            test: 'test'
        },
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'app/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            },
        },
        
        less: {
            development: {
                options: {
                    paths: ["app"],
                    cleancss: false,
                },
                files: {
                    "<%= paths.dist %>/main.min.css": "app/*.less"
                }
          },
        },
        
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= paths.app %>',
                        dest: '<%= paths.dist %>',
                        src: [
                            '*.{ico,png,txt,xml,html}',
                            'images/**/*.{gif,webp,jpg,png}',
                            '*.js',
                        ]
                    },
                ]
            },
        },
                    
        clean: {
            options: { force: true },
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= paths.dist %>'
                    ]
                }]
            }
        },

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'copy', 'less']);

};
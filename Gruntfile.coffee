module.exports = ->
  banner = """/* Hallo <%= pkg.version %> - rich text editor for jQuery UI
 * by Henri Bergius and contributors. Available under the MIT license.
 * See http://hallojs.org for more information
*/"""

  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # CoffeeScript complication
    coffee:
      core:
        expand: true
        src: ['**.coffee']
        dest: 'tmp'
        cwd: 'src'
        ext: '.js'
      toolbar:
        expand: true
        src: ['**.coffee']
        dest: 'tmp/toolbar'
        cwd: 'src/toolbar'
        ext: '.js'
      widgets:
        expand: true
        src: ['**.coffee']
        dest: 'tmp/widgets'
        cwd: 'src/widgets'
        ext: '.js'
      plugins:
        expand: true
        src: ['**.coffee']
        dest: 'tmp/plugins'
        cwd: 'src/plugins'
        ext: '.js'

    # Build setup: concatenate source files
    concat:
      options:
        stripBanners: true
        banner: banner
      full:
        src: [
          'tmp/*.js'
          'tmp/**/*.js'
        ]
        dest: 'examples/hallo.js'

    # Remove tmp directory once builds are complete
    clean: ['tmp']

    # JavaScript minification
    uglify:
      options:
        banner: banner
        report: 'min'
      full:
        files:
          'examples/hallo-min.js': ['examples/hallo.js']

    # Coding standards verification
    coffeelint:
      full: [
        'src/*.coffee'
        'src/**/*.coffee'
      ]

    # Unit tests
    qunit:
      all: ['test/*.html']

  # Build dependencies
  @loadNpmTasks 'grunt-contrib-coffee'
  @loadNpmTasks 'grunt-contrib-concat'
  @loadNpmTasks 'grunt-contrib-clean'
  @loadNpmTasks 'grunt-contrib-uglify'

  # Testing dependencies
  @loadNpmTasks 'grunt-coffeelint'
  @loadNpmTasks 'grunt-contrib-jshint'
  @loadNpmTasks 'grunt-contrib-qunit'

  # Local tasks
  @registerTask 'build', ['coffee', 'concat', 'clean', 'uglify']
  @registerTask 'test', ['coffeelint', 'build', 'qunit']


module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      '  */\n',
    clean: {
      src: ['public/dist']
    },
    sprite: {
      keySignatures: {
        src: ['public/img/key-signatures/*.png'],
        destImg: 'public/img/sprite-key-signatures.png',
        destCSS: 'public/less/sprite-key-signatures.less',
        imgPath: '../../img/sprite-key-signatures.png',
        cssFormat: 'less'
      }
    },
    less: {
      compile: {
        options: {
          yuicompress: true
        },
        files: {
          'public/dist/css/flat-site.css': 'public/less/flat-site.less',
          'public/dist/css/flat-editor.css': 'public/less/flat-editor.less'
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'public/dist/views/auth/_signup.html': 'public/views/auth/_signup.html',
          'public/dist/views/auth/_signin.html': 'public/views/auth/_signin.html',
          'public/dist/views/dashboard/_home.html': 'public/views/dashboard/_home.html',
          'public/dist/views/dashboard/_myscores.html': 'public/views/dashboard/_myscores.html',
          'public/dist/views/dashboard/_newsfeed.html': 'public/views/dashboard/_newsfeed.html',
          'public/dist/views/dashboard/score/_new.html': 'public/views/dashboard/score/_new.html',
          'public/dist/views/dashboard/score/_modal_instruments.html': 'public/views/dashboard/score/_modal_instruments.html',
        }
      }
    },
    ngtemplates: {
      flatAuth: {
        options:    {
          base:     'public/dist/views',
          prepend:  '/views/'
        },
        src:        [ 'public/dist/views/auth/**.html' ],
        dest:       'public/dist/js/auth-templates.js'
      },
      flatDashboard: {
        options:    {
          base:     'public/dist/views',
          prepend:  '/views/'
        },
        src:        [ 
          'public/dist/views/dashboard/**.html',
          'public/dist/views/dashboard/score/**.html'
        ],
        dest:       'public/dist/js/dashboard-templates.js'
      },
    },
    concat: {
      js_deps: {
        src: [
          'public/js/deps/i18next-1.6.3.js',
          'public/js/deps/jquery-2.0.2.min.js',
          'public/js/deps/jquery.cookie.min.js',
          'public/js/deps/jquery-ui-1.10.3.custom.min.js',
          'public/js/deps/angular.min.js',
          'public/js/deps/angular-resource.min.js',
          'public/js/deps/angular-sortable.js',
          'public/js/deps/ng-i18next.bc83dbb649c907c1f7284d240b75f28c6ad83508.js',
          'public/js/deps/bootstrap/modal.js',
          'public/js/deps/bootstrap/collapse.js',
          'public/js/deps/bootstrap/tooltip.js'
        ],
        dest: 'public/dist/js/common.js'
      },
      js_auth: {
        src: [
          'public/js/auth/app.js',
          '<%= ngtemplates.flatAuth.dest %>',
          'public/js/auth/controllers.js',
          'public/js/auth/services.js'
        ],
        dest: 'public/dist/js/flat-auth.js'
      },
      js_dashboard: {
        src: [
          'public/js/dashboard/app.js',
          '<%= ngtemplates.flatDashboard.dest %>',
          'public/js/dashboard/controllers.js',
          'public/js/dashboard/services.js'
        ],
        dest: 'public/dist/js/flat-dashboard.js'
      }
    },
    uglify: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today() %> */\n',
        // mangle: false
      },
      dist: {
        files: {
          'public/dist/js/flat-auth.min.js': '<%= concat.js_auth.dest %>',
          'public/dist/js/flat-dashboard.min.js': '<%= concat.js_dashboard.dest %>',
          'public/dist/js/common.min.js': '<%= concat.js_deps.dest %>'
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-spritesmith');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['clean', 'sprite', 'less', 'htmlmin', 'ngtemplates', 'concat', 'uglify']);
};
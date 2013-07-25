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
        src: ['public/img/icons/sprite/*.png'],
        destImg: 'public/img/flat-icons-sprite.png',
        destCSS: 'public/less/flat-icons-sprite.less',
        imgPath: '../../img/flat-icons-sprite.png',
        cssFormat: 'less'
      }
    },
    font: {
      all: {
        src: ['public/img/icons/font/*.svg'],
        destCss: 'public/less/flat-icons-font.less',
        destFonts: 'public/fonts/flat-icons.{svg,woff,eot,ttf}',
        fontFamily: 'flat-icon',
        cssRouter: function (fontpath) {
          console.log(fontpath);
          return '../../fonts/' + fontpath.split('/').pop();
        }
      }
    },
    svgmin: {
        dist: {
            files: {
              // Assets
              'public/dist/img/logo-f-white-100.svg': 'public/img/logo-f-white-100.svg',
              // Key Signatures
              'public/dist/img/icons/0-C-major_a-minor.svg': 'public/img/icons/sprite/0-C-major_a-minor.svg',
              'public/dist/img/icons/1b-F-major_d-minor.svg': 'public/img/icons/sprite/1b-F-major_d-minor.svg',
              'public/dist/img/icons/1s-G-major_e-minor.svg': 'public/img/icons/sprite/1s-G-major_e-minor.svg',
              'public/dist/img/icons/2b-B-flat-major_g-minor.svg': 'public/img/icons/sprite/2b-B-flat-major_g-minor.svg',
              'public/dist/img/icons/2s-D-major_h-minor.svg': 'public/img/icons/sprite/2s-D-major_h-minor.svg',
              'public/dist/img/icons/3b-E-flat-major_c-minor.svg': 'public/img/icons/sprite/3b-E-flat-major_c-minor.svg',
              'public/dist/img/icons/3s-A-major_f-sharp-minor.svg': 'public/img/icons/sprite/3s-A-major_f-sharp-minor.svg',
              'public/dist/img/icons/4b-A-flat-major_f-minor.svg': 'public/img/icons/sprite/4b-A-flat-major_f-minor.svg',
              'public/dist/img/icons/4s-E-major_c-sharp-minor.svg': 'public/img/icons/sprite/4s-E-major_c-sharp-minor.svg',
              'public/dist/img/icons/5b-D-flat-major_b-flat-minor.svg': 'public/img/icons/sprite/5b-D-flat-major_b-flat-minor.svg',
              'public/dist/img/icons/5s-B-major_g-sharp-minor.svg': 'public/img/icons/sprite/5s-B-major_g-sharp-minor.svg',
              'public/dist/img/icons/6b-G-flat-major_e-flat-minor.svg': 'public/img/icons/sprite/6b-G-flat-major_e-flat-minor.svg',
              'public/dist/img/icons/6s-F-sharp-major_d-sharp-minor.svg': 'public/img/icons/sprite/6s-F-sharp-major_d-sharp-minor.svg',
              'public/dist/img/icons/7b-C-flat-major_a-flat-minor.svg': 'public/img/icons/sprite/7b-C-flat-major_a-flat-minor.svg',
              'public/dist/img/icons/7s-C-sharp-major_a-sharp-minor.svg': 'public/img/icons/sprite/7s-C-sharp-major_a-sharp-minor.svg',
              // Clefs
              'public/dist/img/icons/alto_clef.svg': 'public/img/icons/sprite/alto_clef.svg',
              'public/dist/img/icons/baritone_c_clef.svg': 'public/img/icons/sprite/baritone_c_clef.svg',
              'public/dist/img/icons/bass_clef.svg': 'public/img/icons/sprite/bass_clef.svg',
              'public/dist/img/icons/mezzosoprano_clef.svg': 'public/img/icons/sprite/mezzosoprano_clef.svg',
              'public/dist/img/icons/soprano_clef.svg': 'public/img/icons/sprite/soprano_clef.svg',
              'public/dist/img/icons/tenor_clef.svg': 'public/img/icons/sprite/tenor_clef.svg',
              'public/dist/img/icons/treble_clef.svg': 'public/img/icons/sprite/treble_clef.svg',
              // Notes
              'public/dist/img/icons/note_doublewhole.svg': 'public/img/icons/sprite/note_doublewhole.svg',
              'public/dist/img/icons/note_whole.svg': 'public/img/icons/sprite/note_whole.svg',
              'public/dist/img/icons/note_half.svg': 'public/img/icons/sprite/note_half.svg',
              'public/dist/img/icons/note_quarter.svg': 'public/img/icons/sprite/note_quarter.svg',
              'public/dist/img/icons/note_eighth.svg': 'public/img/icons/sprite/note_eighth.svg',
              'public/dist/img/icons/note_sixteenth.svg': 'public/img/icons/sprite/note_sixteenth.svg',
              'public/dist/img/icons/note_thirtysecondnote.svg': 'public/img/icons/sprite/note_thirtysecondnote.svg',
              'public/dist/img/icons/note_sixtyfourth.svg': 'public/img/icons/sprite/note_sixtyfourth.svg',
            }
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
          'public/dist/views/dashboard/score/_import.html': 'public/views/dashboard/score/_import.html',
          'public/dist/views/dashboard/score/_panel_list.html': 'public/views/dashboard/score/_panel_list.html',
          'public/dist/views/dashboard/score/_modal_instruments.html': 'public/views/dashboard/score/_modal_instruments.html',
          'public/dist/views/dashboard/user/_index.html': 'public/views/dashboard/user/_index.html',
          'public/dist/views/dashboard/user/_newsitem.html': 'public/views/dashboard/user/_newsitem.html',
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
          'public/dist/views/dashboard/score/**.html',
          'public/dist/views/dashboard/user/**.html'
        ],
        dest:       'public/dist/js/dashboard-templates.js'
      },
    },
    concat: {
      js_deps: {
        src: [
          'node_modules/async/lib/async.js',
          'public/js/deps/moment/moment.js',
          'public/js/deps/moment/fr.js',
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
      js_deps_editor: {
        src: [
          'node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js',
          'public/js/deps/underscore-min.js',
          'public/js/deps/raphael-min.js',
          'public/js/deps/MIDI/Base64.js',
          'public/js/deps/MIDI/base64binary.js',
          'public/js/deps/MIDI/MIDI.min.js',
        ],
        dest: 'public/dist/js/common-editor.js'
      },
      js_dashboard: {
        src: [
          'public/js/modules/flat.js',
          'public/js/modules/flat-news.js',
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
          'public/dist/js/common.min.js': '<%= concat.js_deps.dest %>',
          'public/dist/js/common-editor.min.js': '<%= concat.js_deps_editor.dest %>'
        }
      },
    },
    copy: {
      fermata: {
        files: [
          {
            expand: true,
            cwd: 'node_modules/flat-fermata/build/fermata',
            src: ['fermata.js', 'ferama.min.js'],
            dest: 'public/dist/js/'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-spritesmith');
  grunt.loadNpmTasks('grunt-fontsmith');
  grunt.loadNpmTasks('grunt-svgmin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', [
    'clean', 'font', 'svgmin', 'less',
    'htmlmin', 'ngtemplates',
    'concat', 'uglify', 'copy'
  ]);

  grunt.registerTask('win', [
    'clean', 'svgmin', 'less',
    'htmlmin', 'ngtemplates',
    'concat', 'uglify', 'copy'
  ]);
};
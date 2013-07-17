angular.module('flat.editor.toolbarMenu', []).
directive('toolbarMenu', function () {
  return {
    templateUrl: '/views/editor/_toolbarMenu.html',
    controller: ['$rootScope', '$scope', '$timeout', '$element', function ($rootScope, $scope, $timeout, $element) {
      $scope.tools = {
        clef: {
          title: 'Clefs',
          class: 'flat-iconf-treble',
          subs: [
            { title: 'Treble clef', svg: '/dist/img/icons/treble_clef.svg', svgHeight: '70', svgWidth: '50' },
            { title: 'Bartione C clef Mezzo-soprano', svg: '/dist/img/icons/baritone_c_clef.svg', svgHeight: '70', svgWidth: '50' },
            { title: 'Tenor clef', svg: '/dist/img/icons/tenor_clef.svg', svgHeight: '70', svgWidth: '50' },
            { title: 'Alto clef', svg: '/dist/img/icons/alto_clef.svg', svgHeight: '70', svgWidth: '50' },
            { title: 'Clef Mezzo-soprano', svg: '/dist/img/icons/mezzosoprano_clef.svg', svgHeight: '70', svgWidth: '50' },
            { title: 'Clef Soprano', svg: '/dist/img/icons/soprano_clef.svg', svgHeight: '70', svgWidth: '50' },
            { title: 'Clef bass', svg: '/dist/img/icons/bass_clef.svg', svgHeight: '70', svgWidth: '50'  }
          ],
        },
        keySignature: {
          title: 'Keys Signatures',
          class: 'unicode-icon-sharp',
          subs: [
            { title: 'C Major / A Minor', svg: '/dist/img/icons/7b-C-flat-major_a-flat-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/6b-G-flat-major_e-flat-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/5b-D-flat-major_b-flat-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/4b-A-flat-major_f-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/3b-E-flat-major_c-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/2b-B-flat-major_g-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/1b-F-major_d-minor.svg', svgHeight: '70', svgWidth: '70' },

            { title: 'C Major / A Minor', svg: '/dist/img/icons/0-C-major_a-minor.svg', svgHeight: '70', svgWidth: '70' },

            { title: 'C Major / A Minor', svg: '/dist/img/icons/1s-G-major_e-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/2s-D-major_h-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/3s-A-major_f-sharp-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/4s-E-major_c-sharp-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/5s-B-major_g-sharp-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/6s-F-sharp-major_d-sharp-minor.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'C Major / A Minor', svg: '/dist/img/icons/7s-C-sharp-major_a-sharp-minor.svg', svgHeight: '70', svgWidth: '70' },
          ]
        },
        note: {
          title: 'Note',
          class: 'unicode-icon-eighth',
          subs: [
            { title: 'Double whole', svg: '/dist/img/icons/note_doublewhole.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'Whole', svg: '/dist/img/icons/note_whole.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'Half', svg: '/dist/img/icons/note_half.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'Quarter', svg: '/dist/img/icons/note_quarter.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'Eighth', svg: '/dist/img/icons/note_eighth.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'Sixteenth', svg: '/dist/img/icons/note_sixteenth.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'Thirtysecondnote', svg: '/dist/img/icons/note_thirtysecondnote.svg', svgHeight: '70', svgWidth: '70' },
            { title: 'Sixtyfourth', svg: '/dist/img/icons/note_sixtyfourth.svg', svgHeight: '70', svgWidth: '70' },
          ]
        },
        player: {
          title: 'Player',
          class: 'glyphicon glyphicon-headphones',
          subs: [
            { title: 'Play', class: 'glyphicon glyphicon-play' },
            { title: 'Stop', class: 'glyphicon glyphicon-stop' }
          ]
        }
      };

      $scope.showMenu = function (k, e) {
        $scope.tools[k].displayed = !$scope.tools[k].displayed;
        $timeout(function () {
          $scope.tools[k].styles = {};
          if ($scope.tools[k].displayed) {
            $scope.tools[k].styles['min-width'] = $('.toolbar-top .second #tb-' + k).width() + 2;
          }
        }, 0);
      };
    }]
  };
}).
directive('toolbarSvg', ['$http', function ($http) {
  var svgLoader;
  return {
    restrict: 'A',
    scope: {
      svg: '=toolbarSvg',
      width: '=svgWidth',
      height: '=svgHeight'
    },
    template: '<div>{{ svg }}</div>',
    replace: true,
    link: function postLink($scope, $element, $attrs) {
      $scope.$watch('svg', function (url) {
        console.log(url, $scope.width, $scope.height);
        if (!url || url.length === 0) {
          return;
        }

        svgLoader = $http.get(url).success(function (svg) {
          var $svg = $element.html(svg).find('svg');
          // Because jQuery sucks
          $svg[0].setAttribute('viewBox', '0 0 ' + $svg.attr('width') + ' ' + $svg.attr('height'));
          $svg[0].setAttribute('height', $scope.height);
          $svg[0].setAttribute('width', $scope.width);
        });
      });
    }
  };
}]);
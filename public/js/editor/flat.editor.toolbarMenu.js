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
            // { title: 'Clef Mezzo-soprano', class: 'flat-icons-clef-mezzosoprano' },
            // { title: 'Clef Soprano', class: 'flat-icons-clef-soprano' },
            // { title: 'Clef Mezzo-bass', class: 'flat-icons-clef-bass' }
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
          subs: []
        },
        note: {
          title: 'Note',
          class: 'unicode-icon-eighth',
          subs: []
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
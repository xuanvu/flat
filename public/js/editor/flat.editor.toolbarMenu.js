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
            { title: 'Clef Mezzo-soprano', class: 'flat-icons-clef-mezzosoprano' },
            { title: 'Clef Soprano', class: 'flat-icons-clef-soprano' },
            { title: 'Clef Mezzo-bass', class: 'flat-icons-clef-bass' }
          ],
        },
        keySignature: {
          title: 'Keys Signatures',
          class: 'unicode-icon-sharp',
          subs: [
            { title: 'Clef Mezzo-soprano', class: 'flat-icons-clef-mezzosoprano' },
            { title: 'Clef Soprano', class: 'flat-icons-clef-soprano' },
            { title: 'Clef Mezzo-bass', class: 'flat-icons-clef-bass' }
          ]
        },
        note: {
          title: 'Note',
          class: 'unicode-icon-eighth',
          subs: [
            { title: 'Clef Mezzo-soprano', class: 'flat-icons-clef-mezzosoprano' },
            { title: 'Clef Soprano', class: 'flat-icons-clef-soprano' },
            { title: 'Clef Mezzo-bass', class: 'flat-icons-clef-bass' }
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
            $scope.tools[k].styles.width = $('.toolbar-top .second #tb-' + k).width() + 2;
          }
        }, 0);
      };
    }]
  };
});
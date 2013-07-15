angular.module('flat.editor.toolbarMenu', []).
directive('toolbarMenu', function () {
  return {
    templateUrl: '/views/editor/_toolbarMenu.html',
    controller: ['$rootScope', '$scope', function ($rootScope, $scope) {
      $scope.tools = {
        clef: {
          title: 'Clefs',
          class: 'flat-iconf-treble',
          subs: [
            { title: 'Clef Mezzo-soprano', class: 'flat-icons-clef-mezzosoprano' },
            { title: 'Clef Soprano', class: 'flat-icons-clef-soprano' },
            { title: 'Clef Mezzo-bass', class: 'flat-icons-clef-bass' }
          ]
        },
        keySignature: {
          title: 'Keys Signatures',
          class: 'unicode-icon-sharp',
          aclass: 'unicode-icon',
          subs: [
            { title: 'Clef Mezzo-soprano', class: 'flat-icons-clef-mezzosoprano' },
            { title: 'Clef Soprano', class: 'flat-icons-clef-soprano' },
            { title: 'Clef Mezzo-bass', class: 'flat-icons-clef-bass' }
          ]
        },
        note: {
          title: 'Note',
          class: 'unicode-icon-eighth',
          aclass: 'unicode-icon',
          subs: [
            { title: 'Clef Mezzo-soprano', class: 'flat-icons-clef-mezzosoprano' },
            { title: 'Clef Soprano', class: 'flat-icons-clef-soprano' },
            { title: 'Clef Mezzo-bass', class: 'flat-icons-clef-bass' }
          ]
        },
        player: {
          title: 'Player',
          class: 'glyphicon glyphicon-headphones',
          aclass: 'aglyphicon',
          subs: [
            { title: 'Play', class: 'glyphicon glyphicon-play' },
            { title: 'Stop', class: 'glyphicon glyphicon-stop' }
          ]
        }
      };

      $scope.showMenu = function (k) {
        $scope.tools[k].displayed = !$scope.tools[k].displayed;
      };
      console.log('here');
    }]
  };
});
angular.module('flat.editor.toolbarMenu', []).
directive('toolbarMenu', function () {
  return {
    template: '<div class="first"></div><div class="second"></div>',
    controller: ['$rootScope', '$scope', function ($rootScope, $scope) {
    	$scope.toolbar = {
    		clef: {
    			title: 'Clefs',
    			icon: 'icons-mscore/clef.svg',
    			subs: [
    			
    			]
    		}
    		// clef: {
    		// 	icon: 'icons-mscore/clef.svg',
    		// 	subs: [
  				// 	{
  				// 		icon-m
    		// 		}
    		// 	]
    		// }
    	};



      console.log('here');
    }]
  };
});
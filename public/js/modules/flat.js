angular.module('flat', ['jm.i18next']).
  factory('CsrfHandler', function() {
    var CsrfHandler = {};
    var token = null;

    CsrfHandler.set = function( newToken ) {
      token = newToken;
    };

    CsrfHandler.get = function() {
      return token;
    };

    CsrfHandler.wrapActions = function (resource, actions) {
      var wrappedResource = resource;
      for (var i=0; i < actions.length; i++) {
        CsrfWrapper(wrappedResource, actions[i]);
      };

      return wrappedResource;
    };

    var CsrfWrapper = function (resource, action) {
      resource['_' + action]  = resource[action];
      resource[action] = function (data, success, error) {
        return resource['_' + action](
          angular.extend({}, data || {}, {'_csrf': CsrfHandler.get()}),
          success,
          error
        );
      };
    };

    return CsrfHandler;
  }).
  filter('fromNow', function() {
    return function(dateString) {
      return moment(new Date(dateString)).fromNow()
    };
  }).
  directive('file', function() {
    return {
        restrict: 'E',
        template: '<input type="file" />',
        replace: true,
        require: 'ngModel',
        link: function(scope, element, attr, ctrl) {
            var listener = function() {
                scope.$apply(function() {
                    attr.multiple ? ctrl.$setViewValue(element[0].files) : ctrl.$setViewValue(element[0].files[0]);
                });
            }
            element.bind('change', listener);
        }
    }
    });

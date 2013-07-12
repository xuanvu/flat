angular.module('flat', ['flat.news', 'jm.i18next']).
  filter('fromNow', function() {
    return function(dateString) {
      return moment(new Date(dateString)).fromNow()
    };
  });
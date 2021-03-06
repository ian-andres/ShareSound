'use strict';

angular.module('shareSoundApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth, Tracks, $state, $stateParams) {
    $scope.menu = [{
      // 'title': 'Home',
      // 'link': '/'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    
    
    $scope.search = function(){
      console.log("SEARCHINGGGG"); 
      console.log($scope.query); 
      Tracks.searchTracks($scope.query)
      .then( function() {
			$scope.searchResults = Tracks.resultTracks; 
			console.log("found tracks..... " + JSON.stringify($scope.searchResults));
            //$location.path('search'); 
            //this is better than location.path because refresh page if current page 
            $state.transitionTo('search' , $stateParams, {
                reload: true,
                inherit: false,
                notify: true
            });
		})
    
    };
    
    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
    $scope.showUser = function(){
      $location.path('/user');
    }
  });
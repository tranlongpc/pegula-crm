/**
 * Created by Ivana on 20.5.2015..
 */
define(['components/login/loginModule'], function (module) {

    "use strict";

    module.registerController('loginController', function ($scope, $state, $location, authService, userService, $sessionStorage, $timeout, homeService, clientService) {

        $scope.model = {'email': '', 'password': ''};

        $scope.login = function () {
            $scope.errors = [];

            /**
             * Login in the user with the provided email and password
             * Then store the user and the user's client is $sessionStorage
             * to be used throughout the app
             */
            authService.login($scope.model.email, $scope.model.password)
                .then(function () {
                    $scope.user = function () {
                        return userService.getUser($sessionStorage.email).then(function (data) {
                            $sessionStorage.user = data;
                            return data.client;
                        });
                    };
                    $scope.client = function (client) {
                        return clientService.getClient(client).then(function (data) {
                            $sessionStorage.client = data;
                            return data;
                        });
                    };

                    /**
                     * Set the tabs of the home page
                     * Visible tabs depend on the logged in user's permissions
                     * so they have to be reset o every login/logout
                     */
                    $scope.dashboardTabs = function () {
                        $timeout(function () {
                            //Since the service data is persistent even after logout we need to
                            //clear the data o logout (done in appController) and set the data
                            //here again. Is there a better alternative? (besides doing a full reload)
                            homeService.types = [{
                                "title": "USERS",
                                "name": "Users"
                            }]

                        })
                    };


                    /**
                     * Once the user has logged in and there was enough time to store the data in $sessionStorage
                     * go to the app.home state and set the active tab to Users
                     */
                    $scope.goHome = function(){
                        //We need to put this in a timeout, otherwise $localStorage won't have time to write the data
                        //This needs to be refactored, as even a timeout of 500 is sometimes not enough
                        ($timeout(function () {
                            $state.go('app.home', {homeType: 'Users'});
                        }), 1000);
                    };


                    //Making sure promises are resolved in this order.
                    $scope.user().then($scope.client).then($scope.dashboardTabs).then($scope.goHome);


                }, function (data) {
                    $scope.errors = data;
                });

        }
    })
});
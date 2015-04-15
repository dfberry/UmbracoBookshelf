﻿angular.module('umbraco').controller('UmbracoBookshelfFileController', function ($scope, $http, $routeParams, $rootScope, dialogService, umbracoBookshelfResource, umbracoBookshelfService, notificationsService) {

    $scope.model = {};
    $scope.model.filePath = decodeURIComponent($routeParams.id);
    $scope.isEditing = false;
    $scope.isSaving = false;
    $scope.hasEdited = false;
    $scope.model.content = "";
    $scope.config = {};

    function sendMdBroadcast(args) {
        $scope.$broadcast("insertMd", args);
    }

    umbracoBookshelfResource.getConfig().then(function(data) {
        $scope.config = data;
    }).then(function() {
        umbracoBookshelfResource.getFileContents($scope.model.filePath).then(function(data) {
            $scope.model.content = data.Content;
        });
    });

    $scope.toggleEdit = function() {
        $scope.isEditing = !$scope.isEditing;
        $scope.hasEdited = true;

        if (!$scope.isEditing) {
            $scope.save();
        }
    }

    $scope.save = function () {
        if (!$scope.isSaving) {
            $scope.isSaving = true;

            umbracoBookshelfService.saveFile($scope.model.filePath, $scope.model.content).then(function(data) {
                $scope.isSaving = false;
                $scope.hasEdited = false;

                notificationsService.success("Success", "The file has been saved.");
            });
        }
    }

    $rootScope.$on('$locationChangeStart', function (event, nextLocation, currentLocation) {
        if ($scope.hasEdited) {
            $scope.save();
        }
    });

    $scope.insertHeadlineMd = function (number) {
        var hashes = "";

        for (var i = 0; i < number; i++) {
            hashes += "#";
        }

        sendMdBroadcast({
            md: hashes + "Lorem Ipsum" + hashes
        });
    }

    $scope.insertImageMd = function () {
        dialogService.open({
            template: '/App_Plugins/UmbracoBookshelf/dialogs/imageSelector.html',
            show: true,
            callback: function(data) {
                console.log(data);

                sendMdBroadcast({
                    md: "![" + data.alt + "](" + data.filePath + ")"
                });
            }
        });
    }

    $scope.insertLinkMd = function () {
        sendMdBroadcast({
            md: "[clickable](url)"
        });
    }

    $scope.insertOlMd = function () {
        sendMdBroadcast({
            md: "1. foo\n2. bar\n"
        });
    }

    $scope.insertUlMd = function () {
        sendMdBroadcast({
            md: "* foo\n* bar\n"
        });
    }

    $scope.insertCodeMd = function (number) {
        var hashes = "";

        for (var i = 0; i < number; i++) {
            hashes += "`";
        }

        sendMdBroadcast({
            md: hashes + "\n<code>\n" + hashes
        });
    }
});


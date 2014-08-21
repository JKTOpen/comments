'use strict';

angular.module('mean.comments').controller('CommentsController', ['$scope', '$http', 'Global', 'Log', '$stateParams', 'Comments', 'FetchComments', 'socket', 'utils',
  function($scope, $http, Global, Log, $stateParams, Comments, FetchComments, socket, utils) {
    $scope.global = Global;
    $scope.commentEditable = true;

    $scope.taggedUsers = [];
    $scope.mentionsUsers = [];

    $scope.getCommentPeopleTextRaw = function(item) {
      // return '<a href="/#!/users/53df59adb198510000b440e5">' + item.name + '</a>'
      $scope.mentionsUsers.push({
        'id': item._id,
        'name': item.name
      });
      $scope.taggedUsers.push(item._id);
      return '[-' + item.name + ']';
    };

    $scope.package = {
      name: 'comments'
    };
    $scope.loadcomment = false;

    socket.on('commentCreated', function(response) {
      if ($scope.parent._id === response.comment.parent._id) {
        if ($scope.parent.comments.length === 0) {
          $scope.parent.comments = [];
        }
        utils.findAndModify($scope.parent.comments, response.comment.data);
      }
    });

    socket.on('commentDeleted', function(response) {
      if ($scope.parent._id === response.comment.parent._id) {
        utils.findAndRemoveById($scope.parent.comments, response.comment.data);
      }
    });

    socket.on('commentUpdated', function(response) {
      if ($scope.parent._id === response.comment.parent._id) {
        utils.findAndModifyById($scope.parent.comments, response.comment.data);
      }
    });

    $scope.editComment = function(comment) {
      $scope.commentEditable = false;
      comment.editable = true;
      comment.mentionsUsers.forEach(function(user) {
        comment.body = comment.body.replace('<a class="mention-user" href="/#!/users/' + user._id + '">' + user.name + '</a>', '[-' + user.name + ']');
      });
      utils.findAndModify($scope.parent.comments, comment);
    };

    $scope.findComments = function(parent, fixedNumberOfComments) {
      $scope.parent = parent;
      var queryParams = {};

      if (fixedNumberOfComments) {
        queryParams = {
          parentId: parent._id,
          limit: fixedNumberOfComments + 1
        };
      } else {
        queryParams = {
          parentId: parent._id
        };
      }

      FetchComments.query(queryParams)
        .$promise.then(function(comments) {
          comments.forEach(function(comment) {
            comment.mentionsUsers.forEach(function(user) {
              comment.body = comment.body.replace('[-' + user.name + ']', '<a class="mention-user" href="/#!/users/' + user._id + '">' + user.name + '</a>');
            });
          });
          if (fixedNumberOfComments && comments.length > fixedNumberOfComments) {
            $scope.loadcomment = true;
            $scope.parent.comments = comments.slice(0, -1);
          } else {
            $scope.loadcomment = false;
            $scope.parent.comments = comments;
          }
        });
    };

    $scope.remove = function(comment) {
      var status = confirm('Are you sure you want to delete this comment.?');
      if (status) {
        var commentDelete = new Comments(comment);
        commentDelete.$remove().then(function(comment) {
          socket.emit('commentDeleted', {
            data: comment,
            parent: $scope.parent
          });
          utils.findAndRemoveById($scope.parent.comments, comment);
        });
      }
    };

    $scope.update = function(comment) {
      var updateComment = new Comments(comment);
      comment.mentionsUsers.forEach(function(user) {
        comment.body = comment.body.replace('[-' + user.name + ']', '<a class="mention-user" href="/#!/users/' + user._id + '">' + user.name + '</a>');
      });
      angular.extend(comment, updateComment);
      updateComment.$update().then(function(res) {
        if (res.mentionsUsers !== undefined && res.mentionsUsers.length > 0) {
          res.mentionsUsers.forEach(function(user) {
            comment.body = res.body.replace('[-' + user.name + ']', '<a class="mention-user" href="/#!/users/' + user._id + '">' + user.name + '</a>');
          });
        }
        $scope.commentEditable = true;
        comment.editable = false;
        utils.findAndModify($scope.parent.comments, comment);
        socket.emit('commentUpdated', {
          data: comment,
          parent: $scope.parent
        });
      });
    };

    $scope.create = function(body, parent, tagged_users) {
      var comment = new Comments({
        body: body,
        parent: parent._id,
        user: Global.user._id,
        likes: []
      });

      if (tagged_users !== undefined) {
        comment.mentionsUsers = tagged_users;
      }
      comment.$save().then(function(data) {
        var tags_users = [];
        var message_body;
        if (data.mentionsUsers !== undefined && data.mentionsUsers.length > 0) {
          data.mentionsUsers.forEach(function(user) {
            tags_users.push(user._id);
            message_body = data.body.replace('<a class="mention-user" href="/#!/users/' + user._id + '">' + user.name + '</a>', '[-' + user.name + ']');
          });

        }
        data.user = Global.user;
        data.likes = [];
        data.likeIds = [];
        if ($scope.parent.comments.length === 0) {
          $scope.parent.comments = [];
        }
        $scope.parent.comments.push(data);
        if (data.mentionsUsers !== undefined && data.mentionsUsers.length > 0) {
          // tags_users.splice(tags_users.indexOf(Global.user._id), 1);
          var log1 = new Log({
            message: 'has mentioned you in a comment',
            notificationType: 'comment',
            contentId: parent._id,
            teaser: message_body.substring(0, 40),
            eventInitiator: Global.user._id,
            messageFor: [],
            readBy: [],
          });
          log1.messageFor = tags_users;
          log1.$save(function(res) {
            socket.emit('notificationCreate', {
              data: res
            });
          });
          $scope.mentionsUsers.forEach(function(user) {
            data.body = data.body.replace('[-' + user.name + ']', '<a class="mention-user" href="/#!/users/' + user.id + '">' + user.name + '</a>');
          });
        }
        if (data.user._id !== parent.user._id) {
          var log = new Log({
            message: 'wrote a comment on your post',
            notificationType: 'comment',
            contentId: parent._id,
            teaser: message_body.substring(0, 40),
            eventInitiator: Global.user._id,
            messageFor: [],
            readBy: [],
          });
          log.messageFor.push(parent.user._id);
          log.$save(function(res) {
            socket.emit('notificationCreate', {
              data: res
            });
          });
        }
        // Use of utils utils.findAndModify(parent.comments, data);
        socket.emit('commentCreated', {
          data: data,
          parent: parent
        });
      });

      this.body = '';
    };
  }
]);
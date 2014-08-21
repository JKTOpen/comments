'use strict';

angular.module('mean.comments').factory('Comments', ['$resource',
  function($resource) {


    return $resource('comments/:commentId', {
      commentId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
])
  .factory('FetchComments', ['$resource',
    function($resource) {
      var config = {
        query: { // GET /comments
          method: 'GET',
          isArray: true,
          transformResponse: function(comments) {
            comments = angular.fromJson(comments);
            comments.map(function(comment) {
              comment.likeIds = [];
              if (comment.likes) {
                for (var key in comment.likes) {
                  var obj = comment.likes[key];
                  comment.likeIds.push(obj._id);
                }
              }
            });
            return comments;
          }
        },
      };
      return $resource('comments/parent/:parentId', {
        parentId: '@_id'
      }, config);
    }
  ]);

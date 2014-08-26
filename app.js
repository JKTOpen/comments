'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;
var Comments = new Module('comments');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Comments.register(function(app, auth, database) {

  var server = require('http').createServer(app).listen(8282);
  var io = require('socket.io').listen(server);
  io.sockets.on('connection', function(socket) {
    socket.on('commentCreated', function(comment) {
      socket.broadcast.emit('commentCreated', {
        comment: comment
      });
    });

    socket.on('commentDeleted', function(comment) {
      socket.broadcast.emit('commentDeleted', {
        comment: comment
      });
    });

    socket.on('commentUpdated', function(comment) {
      socket.broadcast.emit('commentUpdated', {
        comment: comment
      });
    });
  });
  Comments.routes(app, auth, database);
  Comments.aggregateAsset('js', '/node_modules/comments/public/assets/lib/angular-elastic/elastic.js', {
    absolute: true
  });
  Comments.aggregateAsset('js', '/node_modules/comments/public/assets/lib/angular-emoticons/javascripts/angular-emoticons.js', {
    absolute: true
  });
  Comments.aggregateAsset('js', '/node_modules/comments/public/assets/lib/angular-timeago/src/timeAgo.js', {
    absolute: true
  });
  Comments.aggregateAsset('js', '/node_modules/comments/public/assets/lib/ment.io/dist/mentio.js', {
    absolute: true
  });
  Comments.aggregateAsset('js', '/node_modules/comments/public/assets/lib/Autolinker.js/src/Autolinker.js', {
    absolute: true
  });
  Comments.aggregateAsset('css', '/node_modules/comments/public/assets/lib/ment.io/ment.io/style.css', {
    absolute: true
  });
  Comments.aggregateAsset('css', '/node_modules/comments/public/assets/lib/angular-emoticons/stylesheets/angular-emoticons.css', {
    absolute: true
  });
  Comments.aggregateAsset('css', '/node_modules/comments/public/assets/css/comments.css', {
    absolute: true
  });
  Comments.angularDependencies(['yaru22.angular-timeago', 'emoticonizeFilter', 'monospaced.elastic', 'mentio']);

  return Comments;
});

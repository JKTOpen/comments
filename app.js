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
Comments.register(function(app, auth, database, socket) {
  var io = socket.io; // note this is the socket object set in mean-socket and not the generic socket.io
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


  //We are adding a link to the main menu for all authenticated users
  Comments.menus.add({
    title: 'comments help page',
    link: 'comments help page',
    roles: ['authenticated'],
    menu: 'main'
  });

  Comments.aggregateAsset('js', '/packages/contrib/comments/public/assets/lib/angular-elastic/elastic.js', {
    absolute: true
  });
  Comments.aggregateAsset('js', '/packages/contrib/comments/public/assets/lib/angular-emoticons/javascripts/angular-emoticons.js', {
    absolute: true
  });
  Comments.aggregateAsset('js', '/packages/contrib/comments/public/assets/lib/angular-timeago/src/timeAgo.js', {
    absolute: true
  });
  Comments.aggregateAsset('js', '/packages/contrib/comments/public/assets/lib/ment.io/dist/mentio.js', {
    absolute: true
  });
  Comments.aggregateAsset('js', '/packages/contrib/comments/public/assets/lib/Autolinker.js/src/Autolinker.js', {
    absolute: true
  });
  Comments.aggregateAsset('css', '/packages/contrib/comments/public/assets/lib/ment.io/ment.io/style.css', {
    absolute: true
  });
  Comments.aggregateAsset('css', '/packages/contrib/comments/public/assets/lib/angular-emoticons/stylesheets/angular-emoticons.css', {
    absolute: true
  });
  Comments.aggregateAsset('css', '/packages/contrib/comments/public/assets/css/comments.css', {
    absolute: true
  });

  Comments.angularDependencies(['yaru22.angular-timeago', 'emoticonizeFilter', 'monospaced.elastic', 'mentio', 'mean.socket']);

  return Comments;
});

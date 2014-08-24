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
  Comments.aggregateAsset('css', '/node_modules/comments/public/assets/css/meanUpload.css', {
    absolute: true
  });
  Comments.angularDependencies(['yaru22.angular-timeago', 'emoticonizeFilter', 'monospaced.elastic', 'mentio']);

  return Comments;
});

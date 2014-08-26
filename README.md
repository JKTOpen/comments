README: comments

To include comments, for now, you should just mention the same on


For example on -:

articles/views/view.html or articles/views/list.html

<div>{{article.content}}</div>
<!--Insert here -->
<div ng-include="'node_modules/comments/views/index.html'" data-ng-controller="CommentsController" data-ng-init="findComments(article, 2)"/>
<!-- Voila, you are done. Were you expecting some more steps? :-) -->


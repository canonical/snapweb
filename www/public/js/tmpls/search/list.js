YUI.add("t-tmpls-search-list", function(Y) { Y.namespace("iot.tmpls.search.list").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="row">\n\t<div class="inner-wrapper">\n\t\t<ul class="search-results__list">\n\t\t  ';
 Y.Array.each(this, function (pkg) { 
$t+='\n\t\t  <li class="box search-results__list--item">\n\t\t      <a href="/store/'+
$e($v( pkg.name ))+
'" class="search-results__tags--link"></a>\n\t\t      <div class="one-col"><img class="pkg-img" src="'+
$e($v( pkg.icon_url ))+
'" /></div>\n\t\t      <div class="four-col"><h3>'+
$e($v( pkg.name ))+
'</h3></div>\n\t\t      <div class="two-col">'+
$e($v( pkg.publisher ))+
'</div>\n\t\t      <div class="five-col last-col">'+
$e($v( pkg.title ))+
'</div>\n\t\t  </li>\n\t\t  ';
 }); 
$t+='\n\t\t</ul>\n\t</div>\n</div>';
return $t;
}});
YUI.add("t-tmpls-search-list", function(Y) { Y.namespace("iot.tmpls.search.list").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='\n<div class="search-modal-overlay"></div>\n\n<div class="search-background">\n  <div class="row">\n    <div class="inner-wrapper">\n      <ul class="search-results__list">\n        ';
 Y.Array.each(this, function (pkg) { 
$t+='\n        <li class="box search-results__list--item">\n        <a href="/apps/'+
$e($v( pkg.name ))+
'" class="search-results__tags--link"></a>\n        <div class="one-col"><img class="pkg-img" src="'+
$e($v( pkg.icon_url ))+
'" /></div>\n        <div class="four-col"><h3>'+
$e($v( pkg.title ))+
'</h3></div>\n        <div class="two-col">'+
$e($v( pkg.publisher ))+
'</div>\n        <div class="five-col last-col">'+
$e($v( pkg.title ))+
'</div>\n        </li>\n        ';
 }); 
$t+='\n      </ul>\n    </div>\n  </div>\n</div>';
return $t;
}});
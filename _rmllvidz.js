var lang="fr";

$(document).bind('pagecreate',function(e){
	$('.vid, .eventid').css('font-size','smaller');

});

$(document).bind('pageshow',function(e){
});

var en={
	'Filtrer la liste...': 'Filter list...'
};

function t(txt){
  if (lang=="fr") return txt;
  return en[txt]?en[txt]:txt;
}

function updateNothing() {
  if ($('li:visible').size()==0) {
	$('#nothing').removeClass('hidden');
  } else {
	$('#nothing').addClass('hidden');
  }
}

var filterCallback;
var filterCallbackTimeout;
$(document).bind("mobileinit", function(){
  $.mobile.defaultPageTransition='none';
    // Page
    $.mobile.page.prototype.options.headerTheme="a";
    $.mobile.page.prototype.options.contentTheme="a";
    $.mobile.page.prototype.options.footerTheme="a";
    $.mobile.page.prototype.options.theme="a";

    // Listviews
    $.mobile.listview.prototype.options.headerTheme="a";
    $.mobile.listview.prototype.options.theme="a";
    $.mobile.listview.prototype.options.dividerTheme="a";

    $.mobile.listview.prototype.options.splitTheme="a";
    $.mobile.listview.prototype.options.countTheme="a";
    $.mobile.listview.prototype.options.filterTheme="a";
    $.mobile.listview.prototype.options.filterPlaceholder=t("Filtrer la liste...");
    filterCallback=$.mobile.listview.prototype.options.filterCallback;
    $.mobile.listview.prototype.options.filterCallback=function(text,searchValue) {
    /*    if (filterCallbackTimeout) {
                clearTimeout(filterCallbackTimeout);
        }
        filterCallbackTimeout=setTimeout(updateNothing,100);
*/
        return filterCallback(text.toLowerCase(),searchValue);
    }
});

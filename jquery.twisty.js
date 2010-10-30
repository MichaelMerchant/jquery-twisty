// Created by: Michael Merchant
// Built in consideration of JQuery 1.4.3
(function($){

	var methods = {
		init : function( options ){
			return this.each(function(options){
				
				settings = $.extend({
					title : "",
					openOnLoad: false,
					ajax:true,
				}, options);			
				
				//Grab the header
				if(settings.title && settings.title != ""){
					title = settings.title;
				}else{
					title = $(this).attr("title");
				}
				
	
				if(!settings.ajax){
					//Build the HTML
					$(this).wrapInner("<div class='twistable'></div>");			
	
					$(this).prepend("<span class='clickable'><h3>"
							+ "<img class='twistable ui-icon ui-icon-circle-triangle-s' style='float: left;'/>" 
							+ "<img class='twistable ui-icon ui-icon-circle-triangle-e' style='float: left; display: none;' />"
							+ "<span>" + title + "</span>"
							+ "<span class='twistable' style='display: none;'>(click to expand)</span>"
							+ "</h3></span>");
					
					$(this).append("<br/><br/>");
					
					//Bind click actions
					//TODO extrapolate this into a separate function that can be called later
					//  for tags that later need to be clicked
					$(this).find("span.clickable").click(
							function(){
								//console.log($(this));
								$(this).parent().find(".twistable").toggle();
							}
					);
					
					$(this).find('.twistable').toggle();
				}else{
					//Build the HTML
					$(this).wrapInner("<div class='twistable' loaded='false' style='display:none;'></div>");			
	
					$(this).prepend("<span class='clickable'><h3>"
							+ "<img class='twistable ui-icon ui-icon-circle-triangle-s' style='float: left; display: none;'/>" 
							+ "<img class='twistable ui-icon ui-icon-circle-triangle-e' style='float: left;' />"
							+ "<span>" + title + "</span>"
							+ "<span class='twistable'>(click to expand)</span>"
							+ "</h3></span>");
					
					$(this).append("<br/><br/>");
					
					//In order to save the state of 'loaded' make sure our tag (the parent's contents) are not cached
					 $(this).attr('content','no-cache');
					
					//Bind click actions
					//TODO extrapolate this into a separate function that can be called later
					//  for tags that later need to be clicked
					$(this).find("span.clickable").click(toggle);
				}
			});
		},
		toggle : function(){
			return this.each(function(){
				$(this).children('span').each(toggle);
			});
		},
			
	};
	
	function toggle(){
		$twistable = $(this).parent().find(".twistable");
		if($twistable.filter('div').attr('loaded')=='true'){
			$twistable.toggle();								
		}else{
			url = $(this).parent().attr("url");

			$.get(url, function(response){
				$twistable.filter('div').html(response);
				$twistable.filter('div').attr('loaded','true');
				$twistable.toggle();
			});
		}
	};
	
	jQuery.fn.twisty = function( method ){
	    // Method calling logic
	    if ( methods[method] ) {
	      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
	      return methods.init.apply( this, arguments );
	    } else {
	      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
	    }  
	};
})(jQuery);
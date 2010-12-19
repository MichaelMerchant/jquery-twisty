//Created by: Michael Merchant
//Built in consideration of JQuery 1.4.3
(function($){
  var plugin_settings = {debug : true},
    default_settings = {
      title : "",
      openOnLoad: false,
      ajax:true,
      noSpan: false,
      //Specifies where the ajax loaded content should be placed, if not specified,
      //content is loaded below the twisty
      contentElement: "",
      //Elements with this selector are attached to the toggle that may be outside div
      toggledElements: "",
      //This function specifies what to do on an ajax load
      load: function($contentElement){},
  }
  var methods = {
    init : function( options ){
      return $(this).each(function(){
          var settings = $.extend(true, {}, default_settings);

          if(options){
            settings = $.extend(settings, options);
          }

          // If the plugin hasn't been initialized yet
          var $this = $(this), 
            data = $this.data('twisty');
          if ( ! data ) {
            
            $this.data('twisty', {
              "target" : $this,
              "settings" : settings,
            });
            
            data = $this.data('twisty');
            //Grab the header
            var title;
            title = $this.attr("title");
            if(title && settings.title == ""){
              settings.title = title; 
            }else if(!settings.title){
              settings.title = "";
            }
            
            var toggledElements;
            toggledElements = $this.attr("toggledElements");
            if(toggledElements && settings.toggledElements == ""){
              settings.toggledElements = toggledElements;
              settings.$toggledElements = $(toggledElements); 
            }else if(!settings.toggledElements){
              settings.toggledElements = "";
            }
                        
            if(!settings.ajax){
              //Build the HTML
              $this.wrapInner("<div class='twistable'></div>");
              $this.find('.twistable').toggle();
          
              add_twisty_span_html($this, settings);
    
              //Bind click actions
              //TODO use local toggle function
              $this.find("span.clickable").click(
                  function(){
                    $(this).parent().find(".twistable").toggle();
                  }
              );
      
            }else{
              settings.loaded = false;
              settings.state = 'closed';
              settings.url = $this.attr("url");
              
              var contentElement;
              contentElement = $this.attr("contentElement");
              if(contentElement && settings.contentElement == ""){
                settings.contentElement = contentElement; 
              }else if(!settings.contentElement){
                settings.contentElement = "";
              }
              
              if(!settings.url || settings.url==""){
                $this.removeData("twisty");
                $.error("URL is not properly set for ", $this);
                return $this;
              }
              //Build the HTML
              if(settings.contentElement && settings.contentElement != ""){
                settings.$contentElement = $(this).parents("body").find(settings.contentElement); 
              }else{
                $this.wrapInner("<div class='twistable' style='display:none;'></div>");
              }
              add_twisty_span_html($this, settings);
              
              //Bind click actions
              if(settings.noSpan){
                $this.click(function(){
                  toggleAjax.apply($(this));
                });
              }else{
                $this.children("span.clickable").click(function(){
                  toggleAjax.apply($(this).parent());
                });
              }
            }
          }else if(settings.debug==true){
            $.error("You're trying to initialize the twisty on ",this,", but it has already initialized!");
          }
      });
    },
    toggle : function(){
      var $this = $(this),
      data = $this.data('twisty');
      if(!data){
        $.error("You're trying to toggle",$this,", but it hasn't been initialized.");
      }else{
        var settings = data.settings;
        if(settings.ajax){
          return this.each(function(){
            $this.each(toggleAjax);
          });
        }else{
          var $twistable = $this.find(".twistable");
          if(settings.$toggledElements){
            $twistable.add($toggledElements);
          }
          $this.find(".twistable").toggle();
          return $this;
        }
      }
    },
    reload : function(){
      var $this = $(this),
        data = $this.data('twisty');
      if(! data){
        $.error("You're trying to reload ",$this,", but it hasn't been initialized.");
      }else{
        var settings = data.settings;
        if(settings.ajax){
          var vars = get_ui_elements($this);
          if(vars.$spinner.is(":visible")){
            //if is loading, do nothing
            return;
          }else if(vars.$triangle_s.is(":visible")){
            //if is opened, close and then reload
            vars.$twistable.toggle();
            vars.$triangle_s.hide();
            vars.$triangle_e.show();
            ajax_load($this,vars);
          }else{
            //is closed
            ajax_load($this,vars);
          }
        }else{
          $.error($this, " is not loaded via ajax and cannot be reloaded");
        }
      }
    },

  };
  
  function add_twisty_span_html($twisty_obj, settings){
    var ajax = settings.ajax,
        noSpan = settings.noSpan;
    $twisty_obj.prepend((noSpan ? "" : "<span class='clickable'><h3>")
        + "<img class='" + (ajax ? "" : "twistable ") + "ui-icon ui-icon-circle-triangle-s' style='float: left; display: none;'/>" 
        + (ajax ? "<img class='spinner' style='float:left; display:none;'/>" : "")
        + "<img class='" + (ajax ? "" : "twistable ") + "ui-icon ui-icon-circle-triangle-e' style='float: left;'/>"
        + (settings.title=="" ? "" : ("<span>" + settings.title + "</span>"))
        + (noSpan ? "" : "<span class='twistable'>(click to expand)</span>")
        + (noSpan ? "" : "</h3></span>"));
    if(!settings.noSpan){
      $twisty_obj.append("<br/><br/>");
    }else{
      $twisty_obj.addClass("clickable");
    }
  };
  
  function toggleAjax(){
    var $this = $(this),
      vars = get_ui_elements($this);
    if(vars.settings.loaded){
      vars.$triangle_e.toggle();
      vars.$triangle_s.toggle();
      vars.$twistable.toggle();
    }else if(vars.settings.state != 'loading'){
      ajax_load($this,vars);
    }
  };
  
  function get_ui_elements($this){
    var data = $this.data("twisty"),
      settings = data.settings,
      $span_hr = $($this.children('span').children('h3')),
      $twistable = $this.find(".twistable"),
      $triangle_e, $triangle_s, $spinner;
    if($span_hr.length == 0){
      $triangle_e = $this.children('.ui-icon-circle-triangle-e');
      $triangle_s = $this.children('.ui-icon-circle-triangle-s');
      $spinner = $this.children('.spinner');
    }else{
      $triangle_e = $span_hr.children('.ui-icon-circle-triangle-e');
      $triangle_s = $span_hr.children('.ui-icon-circle-triangle-s');
      $spinner = $span_hr.children('.spinner');
    }
    if(settings.$contentElement){
      $twistable = $twistable.add(settings.$contentElement);
    }
    if(settings.$toggledElements){
      $twistable = $twistable.add(settings.$toggledElements);
    }
    return {'settings':settings,
      '$span_hr':$span_hr,
      '$twistable':$twistable,
      '$triangle_e':$triangle_e,
      '$triangle_s':$triangle_s,
      '$spinner':$spinner}
  }
  
  function ajax_load($this,vars){
    $.ajax({
      url:vars.settings.url,
      type:"GET",
      beforeSend: function(){
        vars.settings.state = 'loading';
        vars.$triangle_e.hide();
        vars.$spinner.show();
      },
      success: function(response){
        if(typeof vars.settings.load === "function"){
          if(vars.settings.$contentElement){
            vars.settings.$contentElement.html(response);
            vars.settings.load.apply($this,[vars.settings.$contentElement]);
          }else{
            vars.$twistable.filter('div').html(response);
            vars.settings.load.apply($this,[vars.$twistable.filter('div')]);
          }
        }else{
          $.error("Twisty load function didn't load properly for",$this);
        }
        vars.settings.loaded = true;
        vars.$twistable.toggle();
        vars.$spinner.hide();
        vars.$triangle_s.show();
        vars.settings.$contentElement.show();
      },
    });
  }

  jQuery.fn.twisty = function( method ){
    var options;
    // Method calling logic
    if ( typeof method === 'object' || ! method ) {
      options = arguments[0];
      return methods.init.apply( this, [options] );
    } else if ( methods[method] ) {
      options = Array.prototype.slice.call( arguments, 1 )[0];
      return methods[ method ].apply( this, [options] );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.twisty' );
    }
  };
})(jQuery);
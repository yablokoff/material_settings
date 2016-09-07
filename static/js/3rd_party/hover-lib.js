// image to display when there is an error loading image.
var errorholder = "/static/img/error.png"

// append a image tag with placeholder src to every link using hover-lib class
jQuery("a.hover-lib").append(
  '<img src="" onerror="this.src=\''+errorholder+'\';" class="hover-lib-hidden" />'
);

// on mouse over switch the image src from placeholder 
// to the image specified in the links id field. 
jQuery("a.hover-lib").on({
    'mouseover' : function(){
        jQuery(this).children('img').attr('src', this.id);
        jQuery(this).children('img').attr('class', 'hover-lib-visible');
    }
});  

// on mouse out switch the image src back to placeholder
jQuery("a.hover-lib").on({
    'mouseout' : function(){
        jQuery(this).children('img').attr('class', 'hover-lib-hidden');
    }
});  

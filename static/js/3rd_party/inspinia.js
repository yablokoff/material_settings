// Custom scripts
$(document).ready(function () {

    // MetsiMenu
    $('#side-menu').metisMenu();

    // Collapse ibox function
    $('.collapse-link').click( function() {
        var ibox = $(this).closest('div.ibox');
        var button = $(this).find('i');
        var content = ibox.find('div.ibox-content');
        content.slideToggle(200);
        button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        ibox.toggleClass('').toggleClass('border-bottom');
        setTimeout(function () {
            ibox.resize();
            ibox.find('[id^=map-]').resize();
        }, 50);
    });

    // Close ibox function
    $('.close-link').click( function() {
        var content = $(this).closest('div.ibox');

        if ($(this).data('toggle') == 'modal') {
            var modal = $(document).find($(this).data('target'));
            var btn = $(modal).find('[data-display="victim"]');

            btn.on('click', function(){
                content.remove();
            });
            return
        }


        content.remove();
    });

    // Small todo handler
    $('.check-link').click( function(){
        var button = $(this).find('i');
        var label = $(this).next('span');
        button.toggleClass('fa-check-square').toggleClass('fa-square-o');
        label.toggleClass('todo-completed');
        return false;
    });

    // Append config box / Only for demo purpose
    /*$.get("skin-config.html", function (data) {
        $('body').append(data);
    });*/

    // minimalize menu
    $('.navbar-minimalize').click(function () {
        $("body").toggleClass("mini-navbar");
        SmoothlyMenu();
    })

    // tooltips
    $('.tooltip-demo').tooltip({
        selector: "[data-toggle=tooltip]",
        container: "body"
    })

    // Move modal to body
    // Fix Bootstrap backdrop issu with animation.css
    $('.modal').appendTo("body")

    // Full height of sidebar
    function fix_height() {
        var heightWithoutNavbar = $("body > #wrapper").height() - 61;
        $(".sidebard-panel").css("min-height", heightWithoutNavbar + "px");
    }
    fix_height();

    // Fixed Sidebar
    // unComment this only whe you have a fixed-sidebar
            //    $(window).bind("load", function() {
            //        if($("body").hasClass('fixed-sidebar')) {
            //            $('.sidebar-collapse').slimScroll({
            //                height: '100%',
            //                railOpacity: 0.9,
            //            });
            //        }
            //    })

    $(window).bind("load resize click scroll", function() {
        if(!$("body").hasClass('body-small')) {
            fix_height();
        }
    })

    $("[data-toggle=popover]")
        .popover();
});


// For demo purpose - animation css script
function animationHover(element, animation){
    element = $(element);
    element.hover(
        function() {
            element.addClass('animated ' + animation);
        },
        function(){
            //wait for animation to finish before removing classes
            window.setTimeout( function(){
                element.removeClass('animated ' + animation);
            }, 2000);
        });
}

// Minimalize menu when screen is less than 768px
$(function() {
    $(window).bind("load resize", function() {
        if ($(this).width() < 769) {
            $('body').addClass('body-small')
        } else {
            $('body').removeClass('body-small')
        }
    })
})

function SmoothlyMenu() {
    if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
        // Hide menu in order to smoothly turn on when maximize menu
        $('#side-menu').hide();
        // For smoothly turn on menu
        setTimeout(
            function () {
                $('#side-menu').fadeIn(500);
            }, 100);
    } else if ($('body').hasClass('fixed-sidebar')){
        $('#side-menu').hide();
        setTimeout(
            function () {
                $('#side-menu').fadeIn(500);
            }, 300);
    } else {
        // Remove all inline style from jquery fadeIn function to reset menu state
        $('#side-menu').removeAttr('style');
    }
}

// Dragable panels
function WinMove() {
    var element = "[class*=col]";
    var handle = ".ibox-title";
    var connect = "[class*=col]";
    $(element).sortable(
        {
            handle: handle,
            connectWith: connect,
            tolerance: 'pointer',
            forcePlaceholderSize: true,
            opacity: 0.8
        })
        .disableSelection();
};

// Custom select

!function () {
    if ($('.custom-select').length) {
        $('.custom-select').each(function(){
            if($(this).hasClass('partial-activation')) {
                $(this).minimalect({
                    'class_container': 'custom-select'
                });
            } else {
                $(this).minimalect({
                    'class_container': 'custom-select',
                    'searchable' : false
                });
            }
        })

        !function () {
            $('.custom-select').each(function () {
                var dropdown = $(this).find('.custom-select__list');
                $(dropdown).customScrollbar()
            })
        }()

    }
}();

!function(){
    $('input.position').on('keydown', function(event){
        var KEY_CODE = {
            UP: 38,
            DOWN: 40
        };
        if(event.keyCode > 47 && event.keyCode < 58 || event.keyCode > 96 && event.keyCode < 106
            || event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 8) {
            switch(event.keyCode) {
                case KEY_CODE.UP:
                    $(this).val(+$(this).val() + 1 );
                    break;
                case KEY_CODE.DOWN:
                    var val = $(this).val();
                    if ((val - 1 ) > 1) {
                        $(this).val(val - 1)
                    } else {
                        $(this).val(1)
                    }
                    break;
            }
        } else {
            return false
        }
    })
}();

$('[data-disable="close"]').on('show.bs.dropdown', function () {
    var dropdown = $(this).find('.dropdown-menu');
    var ignore = dropdown.find('[data-save="data"]')[0];
    $(dropdown).on('click', function(e){
        if(e.target != ignore) e.stopPropagation()
    })
})

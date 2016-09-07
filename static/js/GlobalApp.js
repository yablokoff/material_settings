var settingsGlobal,
    methodsGloabal,
    GlobalApp = {
        init: function() {
            settingsGlobal = {
                csrf: $("[name='csrfmiddlewaretoken']").val()
            };
            this.initHelpers();
            this.bindUIActions();
            if ($().minimalect !== undefined) {
                if ($("[data-not_use_minimalect='yes']").length == 0) {
                    $("select").minimalect();
                }
            }

            if ($("#models_page").length) {
                ls.setItem("seenModels", [])
            }
        },


        initHelpers: function() {
            window.log = function() {
              try {
                return console.log.apply(console, arguments);
              } catch (_error) {}
            };

            $('.modal-vcenter').on('show.bs.modal', function(e) {
              GlobalApp.centerModals($(this));
            });

            $(window).on('resize', GlobalApp.centerModals);
        },

        centerModals: function($element) {
            var $modals;
            if ($element.length) {
                $modals = $element;
            } else {
                $modals = $('.modal-vcenter:visible');
            }
            $modals.each( function(i) {
                var $clone = $(this).clone().css('display', 'block').appendTo('body');
                var top = Math.round(($clone.height() - $clone.find('.modal-content').outerHeight()) / 2);
                top = top > 0 ? top : 0;
                $clone.remove();
                $(this).find('.modal-content').css("top", top);
            });
        },

        removeAction: function(btn) {
            var $this = $(btn),
                victim = $this.parents('[data-display="victim"]')[0],
                itemId = $this.attr("data-item-id");

                var popup = $this.data('href');

                $(popup).modal();
        },

        bindUIActions: function() {

            $(".lang_item").click(function (e) {
                e.preventDefault();

                var value = $(this).data("value"),
                    form = $("form#set_lang"),
                    langField = form.find("[name='language']");

                langField.val(value);
                form.submit();
            });

            $(".notification_accept_link").click(function(e) {
                e.preventDefault();

                var $this = $(this);
                $.ajax({
                    method: "POST",
                    url: $this.data("accept_url"),
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({
                            companyId: $this.data("company_id"),
                            acceptType: $this.data("accept_type")})
                    },
                    success: function(data) {
                        var r = data.response;
                        if (r.success) {
                            $this.text("Accepted");
                        }
                    },
                    error: function (data) {
                        log(data);
                    }
                })
            });

            $(document).on("input", $(".fg-psw").siblings("input")[0], function(e) {
                var el = $(e.target),
                    fgtLink = el.next(".fg-psw");

                if (el.val().length > 17) {
                    fgtLink.fadeOut(300)
                }
                else {
                    fgtLink.fadeIn(300)
                }
            });

            $(".remove_model").click(function(){
                var $this = $(this),
                    victim = $this.parents('[data-display="victim"]')[0],
                    itemId = $this.attr("data-item-id");

                var popup = $this.data('href');

                $(popup).modal();

                $('.modal [data-display="victim"]').click(function(){
                    $.ajax({
                        type: "POST",
                        url: "/client/remove_model/",
                        data: {
                            csrfmiddlewaretoken: settingsGlobal.csrf,
                            itemId: itemId,
                            data: JSON.stringify({"modelId": itemId})
                        },
                        success: function(data) {
                            $(victim).fadeOut(500)
                        },
                        error: function(data) {
                            console.log(data);
                        }
                    });
                });
            });

            $(".cancel_order").click(function() {
                var $this = $(this),
                    victim = $this.parents('[data-display="victim"]')[0],
                    orderId = $(this).data("id");

                var popup = $this.data('href');

                $(popup).modal();

                $('.modal [data-display="victim"]').click(function(){
                    $.ajax({
                        type: "POST",
                        url: "/client/cancel_order/" + orderId + "/",
                        data: {
                            csrfmiddlewaretoken: settingsGlobal.csrf
                        },
                        success: function(data) {
                            if (data.response.success) {
                                var v = $(victim);
                                v.find(".delivery-status").remove();
                                v.find(".status-description").text("Order canceled");
                                v.find(".cancel_order").remove();
                            }
                            else {
                                alert(data.response.message);
                            }
                        },
                        error: function(data) {
                            log(data)
                        }
                    })
                });

            });

            $('.export_csv').click(function () {
                var queryString = $('#filtering_form').serialize();
                document.location = '?' + queryString + "&page=all&as_csv=1";
            });
        }
    };


(function(){
    var globalScope = this;
    $(document).ready(function() {
        GlobalApp.init();
        if (globalScope.menuDropdown !== undefined) {
            menuDropdown(".language-menu", ".menu-toggle", ".sub-nav");
            menuDropdown(".default_menu.dropdown-menu", ".menu-toggle", ".sub-nav");
            menuDropdown(".auth_menu.dropdown-menu", ".menu-toggle", ".sub-nav");
        }
    });
})();
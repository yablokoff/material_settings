var settingsStreamingLanding,
    StreamingLandingUIApp = {
        init: function() {
            var fancyLink = $('[data-action="popup"]');

            settingsStreamingLanding = {
                accessPopupFormContentElem: $("#access-popup-form-content"),
                accessPopupSuccessContentElem: $("#access-popup-success-content"),
            };

            if (fancyLink.length) {
                fancyLink.fancybox({
                    margin: 22,
                    padding: 0,
                    autoSize: false,
                    autoHeight: true,
                    width: 390,
                    wrapCSS: 'global-popup',
                    helpers: {
                        overlay: {
                            locked: true
                        }
                    },
                    afterClose: function() {
                        settingsStreamingLanding.accessPopupSuccessContentElem.addClass("hidden");
                        settingsStreamingLanding.accessPopupFormContentElem.removeClass("hidden");
                        settingsStreamingLanding.accessPopupFormContentElem.find("input[type='email']").val("");
                    }
                });


            }

            this.scrollToFailedMainLandingForm();
            this.bindUIActions();

              $(".users-map.container").backstretch([
                "/static/img/streaming_map_slides/map0.png",
                "/static/img/streaming_map_slides/map1.png",
                "/static/img/streaming_map_slides/map2.png",
                "/static/img/streaming_map_slides/map3.png",
                "/static/img/streaming_map_slides/map4.png",
                "/static/img/streaming_map_slides/map5.png",
                "/static/img/streaming_map_slides/map6.png"
              ], {duration: 2000, fade: 750});
        },

        bindUIActions: function() {
            var _this = this;

            $("#request-access-btn").click(function() {
                var btnElem = $(this),
                    formData = $("#streaming-access-form").serializeArray(),
                    formId = btnElem.data("fid");

                $.ajax({
                    type: "POST",
                    url: "/request_access/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: formId, formData: formData})
                    },
                    success: function(data) {
                        if (!data.response.success) {
                            _this.showErrors(data.response.errors);
                        }
                        else {
                            settingsStreamingLanding.accessPopupFormContentElem.addClass("hidden");
                            settingsStreamingLanding.accessPopupSuccessContentElem.removeClass("hidden");
                        }
                    },
                    error: function(data) {
                        log(data)
                    }
                });
            });

            $(document).on("focusin", "textarea, input, span.input", function() {
                $(this).removeClass("error");
                $(this).tooltip("destroy");
            });

        },

        scrollToFailedMainLandingForm: function () {
            var failedForm = $("#getstarted_form"),
                scrollPos;

            if (failedForm.find(".has-error").length) {
                scrollPos = $failedForm.offset().top;
                $(window).scrollTop(scrollPos);
            }

        }
    };


(function(){
    $(document).ready(function() {
        StreamingLandingUIApp.init();
    });
})();

var settingsLanding,
    LandingUIApp = {
        init: function() {
            settingsLanding = {
                demoFormInputs: $(".has-error .form_demo_input"),
                mainLandingFormInputs: $(".has-error input")
            };

            this.initDemoFormTooltips();
            this.scrollToDemoFormTooltip();
            this.scrollToFailedMainLandingForm();
            this.initCarousel();
            this.initFancyBox();
            this.bindUIActions();
            this.initBackstretch();

            $('[data-toggle="popover"]').popover();
            $(".question").click(function() {
                $(this).toggleClass('closemeplz');
                $(this).next().toggleClass('open');
            });
        },

        showErrors: function(errors) {
            _.each(errors, function (err) {
                var field = $("#" + err.key);
                field.attr({
                    "title": err.desc,
                    "data-toggle": "tooltip"
                }).addClass("error")
            });

            var wrongFields = $("textarea.error, input.error");
            wrongFields.tooltip({
                placement: "bottom",
                trigger: "manual",
                animation: true,
                delay: {"show": 200, "hide": 200}
            });
            wrongFields.tooltip("show");
        },

        bindUIActions: function() {
            var _this = this;

            $("#send_feedback").click(function() {
                var btnElem = $(this),
                    formData = $("#feedback_form").serializeArray(),
                    formId = btnElem.data("fid");

                $.ajax({
                    type: "POST",
                    url: "/send_feedback/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: formId, formData: formData})
                    },
                    success: function(data) {
                        if (!data.response.success) {
                            _this.showErrors(data.response.errors);
                        }
                        else {
                            _this.destroyFormErrors($("#"+formId));
                            Common.successBtn(btnElem, "Successfully sent!")
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

        destroyFormErrors: function (form) {
            var fields = form.find("textarea, input, span.input").removeClass("error");
            fields.tooltip("destroy");
        },

        initDemoFormTooltips: function() {
            settingsLanding.mainLandingFormInputs.tooltip({
                placement: "bottom",
                trigger: "manual",
                animation: true,
                delay: {"show": 200, "hide": 200}
            });

            settingsLanding.demoFormInputs.tooltip({
                placement: "bottom",
                trigger: "manual",
                animation: true,
                delay: {"show": 200, "hide": 200}
            });

            settingsLanding.mainLandingFormInputs.tooltip("show");
            settingsLanding.demoFormInputs.tooltip("show");
        },

        initBackstretch: function() {
            var imgArr = $("#backgroundimages").data("backgroundimages");
            if (imgArr)
                $(".index").backstretch(imgArr, {duration: 5000, fade: 2000});
        },

        scrollToFailedMainLandingForm: function () {
            var failedForm = $("#getstarted_first_form"),
                scrollPos;

            if (failedForm.find(".has-error").length) {
                scrollPos = $("#getstarted").offset().top;
                $(window).scrollTop(scrollPos);
            }

        },

        scrollToDemoFormTooltip: function() {
            var errorDiv = $('#form_demo .tooltip:visible').first(),
                scrollPos;
                if (errorDiv.length) {
                    scrollPos = errorDiv.offset().top - 100;
                    $(window).scrollTop(scrollPos);
                }
        },

        initCarousel: function(){
            $('.brand-carousel').owlCarousel({
                items: 1,
                loop: true,
                nav: true,
                autoplay: true
            });
        },

        initFancyBox: function(){
		    var padding = 30,
                size = [630,505];

            if ($(window).width() < 700) {
                size = [225,185];
                padding = 15;
            }

            $('.iframe-video-l, .iframe-popup-trigger').fancybox({
                margin: 25,
                padding: padding,
                openEffect	: 'none',
                closeEffect	: 'none',
                width: size[0],
                height: size[1],
                wrapCSS: "global-popup"
            });

            $(".contact_us_btn").click(function(e) {
                e.stopImmediatePropagation();
                $.fancybox.open($('#feedback-popup'), {wrapCSS: "global-popup", maxWidth: '90%', maxHeight: '95%', padding: 0});
            });

        }
    };


(function(){
    $(document).ready(function() {
        LandingUIApp.init();
    });
})();
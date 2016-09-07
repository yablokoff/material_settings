var NewLandingUINamespace = {

        PopupSignupLandingApp: {
        init: function() {
            this.bindUIActions();
            this.initLocalMethods();
        },

        initLocalMethods: function() {

            this._inner = {

                showErrors: function(errors) {
                    _.each(errors, function (err) {
                        var field = $("#" + err.key);
                        field.attr({
                            "title": err.desc,
                            "data-toggle": "tooltip"
                        }).addClass("error")
                    });

                    var wrongFields = $("input.error");
                    wrongFields.tooltip({
                        placement: "bottom",
                        trigger: "manual",
                        animation: true,
                        delay: {"show": 200, "hide": 200}
                    });
                    wrongFields.tooltip("show");
                },

                hideInputError: function(inputElem) {
                    inputElem.next(".tooltip").hide();
                }
            }
        },

        bindUIActions: function() {
            var _this = this;

            $(".price_choice_btn, .btn-signup").click(function (e) {
                e.stopImmediatePropagation();
                $.fancybox.open($('#company-register-popup'), {wrapCSS: "global-popup green-close", maxWidth: '90%', maxHeight: '95%', padding: 0});
            });

            $("#company_register_popup_form_submit").bind("click", function(e) {
                e.stopImmediatePropagation();
                var $this = $(this),
                    form = $this.closest("form"),
                    formId = $this.data("fid"),
                    formData = form.serializeArray();

                $.ajax({
                    type: "POST",
                    url: "/pricing/popup_register/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: formId, formData: formData})
                    },
                    success: function(data) {
                        if (!data.response.success) {
                            _this._inner.showErrors(data.response.errors);
                        }
                        else {
                            if (data.response.redirect_url) {
                                document.location.replace(data.response.redirect_url);
                            }
                        }
                    },
                    error: function(data) {
                        log(data)
                    }
                });

                $(document).on("click", "input.error", function () {
                    _this._inner.hideInputError($(this));
                });
            });
        }
    },

    PricingLandingApp: {
        init: function() {
            this.settings = this.initSettings();
            this.initLocalMethods();

            this._inner.initComplexRegisterFormTooltips();
            this.bindUIActions();
            this._inner.scrollToFailedComplexForm();
        },

        initSettings: function() {
            return {
                complexFormElem: $("#complex_company_register_form"),
                complexFormFailedInputs:  $("#complex_company_register_form .error")
            };
        },

        initLocalMethods: function() {
            var _this = this;

            this._inner = {
                initComplexRegisterFormTooltips: function () {
                    _this.settings.complexFormFailedInputs.each(function () {
                        $(this).tooltip({
                            trigger: "manual",
                            title: $(this).data("errors"),
                            placement: "bottom"
                        });
                        $(this).tooltip("show");
                    });

                    _this.settings.complexFormFailedInputs.click(function () {
                        _this._inner.hideInputError($(this));
                    });

                },

                scrollToFailedComplexForm: function() {
                    var errorDiv = _this.settings.complexFormFailedInputs.first();
                        if (errorDiv.length) {
                            $('html, body').animate({
                                scrollTop: errorDiv.offset().top - 100
                            }, 700);
                        }
                },

                showErrors: function(errors) {
                    _.each(errors, function (err) {
                        var field = $("#" + err.key);
                        field.attr({
                            "title": err.desc,
                            "data-toggle": "tooltip"
                        }).addClass("error")
                    });

                    var wrongFields = $("input.error");
                    wrongFields.tooltip({
                        placement: "bottom",
                        trigger: "manual",
                        animation: true,
                        delay: {"show": 200, "hide": 200}
                    });
                    wrongFields.tooltip("show");
                },

                hideInputError: function(inputElem) {
                    inputElem.next(".tooltip").hide();
                }
            }
        },

        bindUIActions: function() {
            var _this = this;

            $(".price_choice_btn, .btn-signup").click(function (e) {
                e.stopImmediatePropagation();
		        $.fancybox.open($('#company-register-popup'), {wrapCSS: "global-popup green-close", maxWidth: '90%', maxHeight: '95%', padding: 0});
            });

            $("#company_register_popup_form_submit").bind("click", function(e) {
                e.stopImmediatePropagation();
                var $this = $(this),
                    form = $this.closest("form"),
                    formId = $this.data("fid"),
                    formData = form.serializeArray();

                $.ajax({
                    type: "POST",
                    url: "/pricing/popup_register/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: formId, formData: formData})
                    },
                    success: function(data) {
                        if (!data.response.success) {
                            _this._inner.showErrors(data.response.errors);
                        }
                        else {
                            if (data.response.redirect_url) {
                                document.location.replace(data.response.redirect_url);
                            }
                        }
                    },
                    error: function(data) {
                        log(data)
                    }
                });

                $(document).on("click", "input.error", function () {
                    _this._inner.hideInputError($(this));
                });
            });
        }
    },

    SignInLandingApp: {
        init: function() {
            this.settings = this.initSettings();
            this.initLocalMethods();

            this.bindUIActions();
            NewLandingUINamespace.PopupSignupLandingApp.init();
        },

        initSettings: function() {
            return {
            };
        },

        initLocalMethods: function() {
            var _this = this;

            this._inner = {
            }
        },

        bindUIActions: function() {
            var _this = this;

            $("#email_form").submit(function(e) {
                e.preventDefault();
                var emailInput = $("#user_email"),
                    email = emailInput.val();
                $("#user_companies_request_loader").removeClass("hidden");
                $("#user_companies_wrap").empty();

                $.ajax({
                    type: "GET",
                    url: "/manage/load_user_companies/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({email: email})
                    },
                    complete: function(data) {
                        $("#user_companies_request_loader").addClass("hidden");
                    },
                    success: function(data) {
                        if (data.response.success){
                            emailInput.removeClass("error");
                            t = _.template($("#user_companies_item").html());
                            comp = t({
                                companies: data.response.user_companies
                            });
                            $("#user_companies_list_title").show();
                            $("#user_companies_wrap").html(comp);
                        }
                        else {
                            emailInput.addClass("error");
                            emailInput.tooltip({
                                trigger: "manual",
                                title: data.response.error,
                                placement: "bottom"
                            });
                            emailInput.tooltip("show");
                        }

                    },
                    error: function(data) {
                        log(data, "e")
                    }
                });
            });

            $(document).on("input", "#user_email", function() {
                $("#user_companies_wrap").empty();
            });

            $(document).on("input", "input.error", function () {
                $(this).tooltip('destroy');
            });

            $(document).on("click", ".fgt-pass", function(e) {
                e.stopImmediatePropagation();

                var $this = $(this),
                    emailInput = $("#user_email"),
                    email = emailInput.val();

                $.ajax({
                    type: "POST",
                    url: "/reset_password/recover/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({email: email})
                    },
                    success: function(data) {
                        var successText = $this.siblings("div.fgt-pass-sent");

                        $this.addClass("hidden");
                        successText.removeClass("hidden");

                        setTimeout(function() {
                            $this.removeClass("hidden");
                            successText.addClass("hidden");
                        }, 5000)
                    },
                    error: function(data) {
                        log(data, "e")
                    }
                });
            });

            $(document).on("submit", ".company_login_form", function(e) {
                e.preventDefault();

                var btn = $(this).find(".sing_in_btn"),
                    emailInput = $("#user_email"),
                    email = emailInput.val(),
                    companyId = btn.data("company_id"),
                    passwordInput = $(".pass_input[data-company_id='"+companyId+"']"),
                    password = passwordInput.val();

                $.ajax({
                    type: "POST",
                    url: "/manage/login_ajax/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({email: email, password: password, companyId: companyId})
                    },
                    success: function(data) {
                        if (data.response.success){
                            passwordInput.removeClass("error");
                            document.location.replace(data.response.redirect_url);
                        }
                        else {
                            passwordInput.addClass("error");
                            passwordInput.tooltip({
                                trigger: "manual",
                                title: data.response.error,
                                placement: "bottom"
                            });
                            passwordInput.tooltip("show");
                        }
                    },
                    error: function(data) {
                        log(data, "e")
                    }
                });
            });
        }
    }
};

$(document).ready(function() {
    UTIL.init(NewLandingUINamespace);
});
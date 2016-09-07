var PersonalUIActions = function() {
    var s = {
            saveButtons: $(".form_save_btn"),
            processAjaxFormsUrl: $("[data-process_forms_url]").data("process_forms_url"),
            inputs: $("input")
        },

        init = function() {
            bindUIActions();
            initLocalMethods();

            $("input, span.input").click(function() {
                $(this).tooltip("destroy");
            })
        },

        initLocalMethods = function() {
            s.localMethods = {
                getFormsResponseMethod: function(formId) {
                    var methodName = "process" + formId.split("_").map(Common.capitalizeFirst).join("") + "Response";
                    return s.localMethods[methodName]
                },

                processResponseErrors: function(response) {
                    $.each(response["errors"], function() {
                        var input = $("#" + this.key),
                            title = this.desc,
                            elemForTooltip = input,
                            selectWrapper = $(".custom-select_wrap[data-input_id='"+this.key+"']");

                        if (selectWrapper.length) {
                            elemForTooltip = selectWrapper.find("span.input");
                        }

                        if (this.key == s.orderEmailsFieldId) {
                            elemForTooltip = s.orderEmailsTagsInputElem;
                        }

                        if (this.key == "finance_form") {
                            elemForTooltip = $("#finance_form .forms_wrap");
                            title = this.errors_desc.join(";\n");
                        }

                        elemForTooltip.tooltip({
                            trigger: "manual",
                            title: title,
                            placement: "bottom"
                        });
                        elemForTooltip.tooltip("show");
                    });
                }
            }
        },

        bindUIActions = function() {

            s.saveButtons.click(function() {
                var btn = $(this),
                    formId = btn.data("fid"),
                    parentForm = $("#" + formId),
                    formData = parentForm.serializeArray();

                $.ajax({
                    type: "POST",
                    url: s.processAjaxFormsUrl,
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: formId, formData: formData})
                    },
                    success: function(data) {
                        log(data);
                        var res = data.response,
                            method;
                        if (res.success) {
                            if (formId == "change_password_form") {
                                $("#" + formId).find("input").val("");
                            }
                            Common.successBtn(btn, "Saved");
                            method = s.localMethods.getFormsResponseMethod(formId);
                            if (method) {
                                method(res);
                            }
                        }
                        else {
                            log(res);
                            s.localMethods.processResponseErrors(res)
                        }
                    },
                    error: function(data) {
                        log(data)
                    }
                });
            });
        };

    init();
    };

(function(){
    $(document).ready(function() {
        PersonalUIActions();
    });
})();

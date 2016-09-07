var CompanyUIActions = function() {
    var s = {
            saveButtons: $(".form_save_btn"),
            processAjaxFormsUrl: $("[data-process_forms_url]").data("process_forms_url"),
            changeLogoUrl: $("[data-change_logo_url]").data("change_logo_url"),
            logoElemId: "company_logo",
            inputs: $("input"),
            customShippingFormElem: $('#custom_shipping_form'),
            collapseCustomShippingFormArrow: $("#show_custom_shipping_form span"),
            radioButtonsToFormsBtns: $(".radio_buttons_to_forms .radio_buttons_wrap")
        },

        init = function() {
            bindUIActions();
            fineUploaderInit();
            initLocalMethods();
            initOrderEmailsInput();
            
            if ($().select2) {

                function matchStart(params, data) {
                    params.term = params.term || '';
                    if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) == 0) {
                        return data;
                    }
                    return false;
                }

                $(".custom-select_wrap select[name='country'], " +
                  ".custom-select_wrap select[name='state']").select2({
                    matcher: function(params, data) {
                        return matchStart(params, data);
                    },
                });
                $(".custom-select_wrap select[name='currency']").select2({
                    minimumResultsForSearch: Infinity
                });
            }

            $(".js-switch").each(function() {
                "use strict";
                Switchery(this);
            });

            $("input, span.input").click(function() {
                $(this).tooltip("destroy");
            })
        },

        initOrderEmailsInput = function() {
            var actualField = $("#id_order_emails"),
                tagsInputField;

            actualField.tagsinput();
            tagsInputField = actualField.siblings(".bootstrap-tagsinput");
            s.orderEmailsFieldId = actualField.attr("id");
            s.orderEmailsTagsInputElem = tagsInputField;
        },

        initLocalMethods = function() {
            s.localMethods = {
                getFormsResponseMethod: function(formId) {
                    var methodName = "process" + formId.split("_").map(Common.capitalizeFirst).join("") + "Response";
                    return s.localMethods[methodName]
                },

                processCustomShippingFormResponse: function(response) {
                    var t = _.template($("#custom_shipping_item_template").html()),
                    compiled = $(t(response));
                    compiled.find(".any_price").text(response.cost);

                    $("#shippings_list_wrap").append(compiled);
                    compiled.fadeIn();

                    if ($(".custom_shipping_type").length) {
                        $("#no_shippings_info_text").addClass("hidden");
                    }

                    s.customShippingFormElem.find("input, select").each(function() {
                        $(this).val("").change();
                    })
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

            $("#id_country").change(function() {
                "use strict";
                var $this = $(this),
                    stateSelectElem = $(".form-group[data-field_id='id_state']");

                stateSelectElem.find("span.input").tooltip("hide");

                if ($this.val() != "US") {
                    stateSelectElem.fadeOut().addClass("hidden");
                }
                else {
                    stateSelectElem.hide().removeClass("hidden").fadeIn();
                }
            });

            s.radioButtonsToFormsBtns.on("change", "input", function () {
                var $this = $(this),
                    id = $this.attr("id"),
                    groupId = $($this.parents(".radio_buttons_wrap").get(0)).data("group_id"),
                    formsWrap = $(".forms_wrap[data-group_id='" + groupId +"']"),
                    formWrapToShow = $(".forms_wrap [data-id='" + id + "']"),
                    formWrapsToHide = formsWrap.find(".payment_method_form");

                formsWrap.tooltip("destroy");
                formWrapsToHide.addClass("hidden");
                formWrapToShow.hide().removeClass("hidden").fadeIn();
            });

            s.customShippingFormElem.on('show.bs.collapse', function () {
               s.collapseCustomShippingFormArrow.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
            });

            s.customShippingFormElem.on('hide.bs.collapse', function () {
               s.collapseCustomShippingFormArrow.removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
            });

            $("input[name='shipping_type']").change(function() {
                var targetFormId = $(this).data("target_fid"),
                    targetFormElem = $("#" + targetFormId),
                    visibleForm = $(".shipping_form_blocks:visible");

                visibleForm.addClass("hidden");
                targetFormElem.hide().removeClass("hidden").fadeIn();
            });

            $("#change_shipping_type").click(function() {
                var $this = $(this),
                    shippingType = $("input[name='shipping_type']:checked").val();

                if (shippingType == "custom_shipping" && !$(".custom_shipping_type").length) {
                    toastr["warning"]("Sorry, you should add custom shipping types first.");
                    return false;
                }

                $.ajax({
                    type: "POST",
                    url: "/manage/company/change_shipping_type/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({shippingType: shippingType})
                    },
                    success: function(data) {
                        log(data);
                        if (data.response.success) {
                            Common.successBtn($this, "Saved");
                        }
                    },
                    error: function (data) {
                        log(data);
                    }
                })
            });

            $(document).on("click", ".remove_custom_shipping", function () {
                var $this = $(this),
                    shippingId = $this.data("custom_shipping_id"),
                    shippingElem = $(".custom_shipping_type[data-custom_shipping_id='" + shippingId + "']");

                $.ajax({
                    type: "POST",
                    url: "/manage/company/remove_shipping/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({shippingId: shippingId})
                    },
                    success: function(data) {
                        log(data);
                        if (data.response.success) {
                            shippingElem.fadeOut().remove();
                            if (!$(".custom_shipping_type").length) {
                                $("#no_shippings_info_text").removeClass("hidden");
                            }
                        }
                    },
                    error: function (data) {
                        log(data);
                    }
                })
            });

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
        },

        fineUploaderInit = function() {
            $('#company_logo_fine_uploader').fineUploader({
              template: "qq-simple-thumbnails-template",
              button: $("#logo_upload_btn"),
              request: {
                endpoint: s.changeLogoUrl,
                params: {
                    csrfmiddlewaretoken: settingsGlobal.csrf,
                    logoId: s.logoElemId
                }
              },
              multiple: false,
              validation: {
                  allowedExtensions: ['jpeg', 'jpg', 'gif', 'png']
              }
            }).on('complete', function(event, id, name, response, xhr){
                    $("#company_logo_fine_uploader .qq-upload-list").empty();
                    $("#company_logo").attr("src", response["new_logo_url"]);
            });
        };



    init();
    };

(function(){
    $(document).ready(function() {
        CompanyUIActions();
    });
})();

var StepsUIActions = function() {
    var s = {
            modelsPriceElem: $(".price-model .any_price"),
            totalPriceElem: $(".total-price .any_price"),
            epFields: $(".ep"),
            stateSelectField: $("select[name=state]"),
            shippingRateTemplate: $("#shipping_rate_template"),
            deliveryLoader: $("#delivery_loader"),
            deliveryInfo: $("#delivery_info"),
            hiddenThumbsLen: $(".hidden_thumb").length,
            cartItemsCounter: $("#cart_items_counter"),

            s2emptyPrices: $("[data-empty_prices]").data("empty_prices"),
            s2readyModels: $("[data-ready_models]").data("ready_models"),
            s2modelsCount: $("[data-models_count]").data("models_count"),
            s2uploadedModelsPopoverTemplateText: $("#uploaded_models_popover_template").text(),
            s2uploadedModelsPopoverViewportElem: $("#viewport"),
            s2uploadedModelsPopoverWrapperElem: $("#uploaded_models_popover_wrapper"),
            s2getUserEmailPopup: $("#get_user_email_popup"),
            s2getUserExtraInfoPopup: $("#get_user_extra_info_popup"),
            s2manualCheckFormFUButton: null,
            s2getEmailPopupFormElem: $("#get_user_email_form"),
            s2checkPasswordPopupFormElem: $("#check_user_password_form"),
            s2getUserExtraInfoFormElem: $("#user_extra_info_form"),
            s2ModelViewers: {},

            s3PreviousStepUrl: $("[data-previous_step_url]").data("previous_step_url"),
            s3NotesAttachUploader: null,

            s4CurrentRatesRequestId: "",
            s4ShipmentElements: $("#shipment_block, #shipment_head, #delivery_form"),
            s4CustomerCompanyBlock: $("#customer_company_wrapper"),
            s4DeliveryCountrySelectId: "id_delivery_form-country",
            s4CustomerCompanyCountrySelectId: "id_customer_company_form-country",
            s4DeliveryStateSelectWrapper: $("#id_delivery_form-state_wrapper"),
            s4CustomerCompanyStateSelectWrapper: $("#id_customer_company_form-state_wrapper"),
            s4CustomerCompanyCheckbox: null
        },

        init = function() {
            bindUIActions();

            if ($("#s4").length) {
                initDeliveryForm();
                initDeliveryFormTooltips();

                s.s4CustomerCompanyCheckbox = $('#customer_company_checkbox').iCheck({
                    checkboxClass: 'icheckbox_square-green'
                });
                initCustomerCompanyForm();
            }

            if ($("#s1").length) {
                ls.setItem("seenModels", []);
            }

            if ($("#s2").length) {
                openGetUserEmailPopup();
                updateProgressBar();

                init3DViewers();

                if (s.s2emptyPrices.length) {
                    setPricesRefresh(s.s2emptyPrices)
                }
                if ($("#s2").data("all_wt_checks_ready") != "True") {
                    setWallThicknessRefresh();
                }

                $('[data-toggle="popover"]').popover();
                initLoadingDots();
                initS2AttachmentBtn();
                initUploadedModelsPopover();

                var modelId = getActiveModelId();
                changeActiveModel(modelId);
                updateSeenModels(modelId);
            }

            if ($("#s3").length) {
                initS3AttachUploader();
            }

            if (s.hiddenThumbsLen) {
                setDynamicImgRefresh();
            }

        },

        setWallThicknessRefresh = function() {
            var modelsIds = _.map($(".shipment-base"), function(elem, i) {
                return $(elem).data("model_id")
            });

            var intervalId = setInterval(function() {
                $.ajax({
                    type: "GET",
                    url: "/check_wall_thickness_status/",
                    data: {modelsIds: modelsIds},
                    success: function(data) {
                        var r = data.response;
                        log(r);
                        if (r.success) {
                            if (r["all_models_wt_ready"]) {
                                clearInterval(intervalId);
                            }
                            _.each(r["ready_materials"], function(elem) {
                                var wtStatusWrapper = $("" +
                                    ".shipment-base[data-model_id='" + elem.model_id + "'] " +
                                    ".material_prices_specs[data-material_id='" + elem.material_id + "'] " +
                                    ".wall_thickness_status ");

                                wtStatusWrapper.find(".wt_status_text").addClass("hidden");

                                if (elem.passed) {
                                    wtStatusWrapper.find(".wt_passed").removeClass("hidden");
                                }
                                else {
                                    wtStatusWrapper.find(".wt_failed").removeClass("hidden");
                                }
                            });
                        }
                    },
                    error: function(data) {
                        log(data);
                    }
                });
            }, 4000);
        },

        init3DViewers = function() {
            "use strict";
            $(".model_3d_view_wrapper").each(function() {
                var $this = $(this),
                    fileUrl = $this.data("model_obj_url"),
                    modelId = $this.data("model_id"),
                    maxSizes = $this.data("model_max_sizes");
                log(maxSizes);
                s.s2ModelViewers[modelId] = new ModelViewer($this, fileUrl, maxSizes);
            });
        },

        openGetUserEmailPopup = function() {
            "use strict";
            var popupElem = s.s2getUserEmailPopup;

            if (popupElem.length) {
                $.fancybox.open(popupElem, {
                    wrapCSS: "get_user_email_popup",
                    autoSize: true,
                    padding: 0,
                    closeBtn: false,
                    closeClick: false,
                    modal: true
                });
            }
        },

        openGetUserExtraInfoPopup = function() {
            "use strict";

            if (s.s2getUserExtraInfoPopup.length) {
                $.fancybox.open(s.s2getUserExtraInfoPopup, {
                    wrapCSS: "get_user_extra_info_popup",
                    autoSize: true,
                    padding: 0,
                    closeBtn: false,
                    closeClick: false,
                    modal: true
                });
            }

        },

        emailSubmitBtnShowContent = function(btnElem, contentType) {
            "use strict";
            if (contentType == "loader") {
                btnElem.find("span").addClass("hidden");
                btnElem.find("img").removeClass("hidden");
            }

            if (contentType == "text") {
                btnElem.find("img").addClass("hidden");
                btnElem.find("span").removeClass("hidden");
            }
        },

        updateProgressBar = function() {
            var progressBarLength = s.s2readyModels.length/s.s2modelsCount * 100 || 2;
            $("#progress_line").css("width", progressBarLength + "%");
            if (s.s2readyModels.length == s.s2modelsCount) {
                $("#all_models_progress_bar").fadeOut(500);
            }
        },

        getTemplatePopoverContent = function() {
             return $('<div />').html(s.s2uploadedModelsPopoverTemplateText);
        },

        getTemplatePopoverContentHtml = function() {
            return getTemplatePopoverContent().html();
        },

        getActiveModelId = function() {
            return getTemplatePopoverContent().find(".active").data("model_id");
        },

        updateSeenModels = function(modelId) {
            var seenModels = ls.getItem("seenModels"),
                _modelId = modelId || getActiveModelId();


            if (!_.contains(seenModels, _modelId)) {
                seenModels.push(_modelId);
                ls.setItem("seenModels", seenModels);
            }
            $("#seen_models").text(seenModels.length);
        },

        updateModelStatus = function(modelId, status) {
            var currentPopoverModelStatus = $(".uploaded_model_status_bar[data-model_id='"+modelId+"'] .model_status"),
                popoverTemplateContent= getTemplatePopoverContent();

            // change status in currently opened popover
            currentPopoverModelStatus
                .removeClass("active")
                .filter("." + status)
                .addClass("active");

            // and in popover template
            popoverTemplateContent
                .find(".uploaded_model_status_bar[data-model_id='"+modelId+"'] .model_status")
                .removeClass("active")
                .filter("." + status)
                .addClass("active");

            updatePopoverTemplateContent(popoverTemplateContent);
        },

        updatePopoverTemplateContent = function(newContent) {
            // save changed popover content, to use it when popover will be opened next time
            s.s2uploadedModelsPopoverTemplateText = newContent.html();
        },

        initUploadedModelsPopover = function() {
            s.s2uploadedModelsPopoverViewportElem.popover({
                content: getTemplatePopoverContentHtml,
                html: true,
                container: s.s2uploadedModelsPopoverWrapperElem,
                placement: "bottom",
                trigger: 'focus',
                template: '<div class="popover uploaded_models_list" id="iploaded_models_popover" role="tooltip">' +
                              '<div class="arrow"></div>' +
                              '<h3 class="popover-title"></h3>' +
                              '<div class="popover-content"></div>' +
                          '</div>'
            });
            s.s2uploadedModelsPopoverViewportElem.focus();
        },

        initS2AttachmentBtn = function() {
            s.s2manualCheckFormFUButton = $("#upload_model").fineUploader({
                debug: true,
                progressBar: true,
                validation: {
                    sizeLimit: 3145728
                },
                messages: {
                    sizeError: "{file} is too big, maximum file size is {sizeLimit}.",
                    emptyError: "{file} is empty, please, try another file."
                },
                request: {
                    endpoint: "/upload_file/"
                }
            }).on("submit", function() {
                s.s2manualCheckFormFUButton.fineUploader('setParams', {
                    upload_type: "s2_manual_check_attach",
                    data: JSON.stringify({modelId: $(".active.shipment-base").data("obj-id")}),
                    csrfmiddlewaretoken: settingsGlobal.csrf
                });
            }).on('complete', function(event, id, fileName, responseJSON, xhr) {
                $("#uploading_bar").hide().removeAttr("id");

                if (responseJSON.success) {
                    $("#uploaded_filename i").text(fileName);
                    $("#id_attach_uuid").val(responseJSON.uuid);
                    $("#id_attach_filename").val(responseJSON.filename);
                    $(document).trigger("onRmcAttachUploaded");
                }
            }).on("error", function(event, id, fileName, errText, xhr) {
            });
        },

        initS3AttachUploader = function() {
            s.s3NotesAttachUploader = $("#upload_attachment").fineUploader({
                debug: true,
                progressBar: false,
                multiple: false,
                validation: {
                    sizeLimit: 3145728
                },
                messages: {
                    sizeError: "{file} is too big, maximum file size is {sizeLimit}.",
                    emptyError: "{file} is empty, please, try another file."
                },
                request: {
                    endpoint: "/upload_file/",
                    params: {
                        upload_type: "s3_order_notes_attach",
                        csrfmiddlewaretoken: settingsGlobal.csrf
                    }
                },
                deleteFile: {
                    enabled: true,
                    endpoint: '/remove_uploaded/',
                    method: "POST",
                    params: {
                        upload_type: "s3_order_notes_attach",
                        csrfmiddlewaretoken: settingsGlobal.csrf
                    }
                }
            }).on('complete', function(event, id, fileName, responseJSON, xhr) {
                if (responseJSON.success) {
                    $("#uploaded_filename i").text(fileName);
                    $("#id_file_path").val(responseJSON.path);
                    $("#s3_remove_attach").show();
                    $(document).trigger("onS3AttachUploaded");
                }
            }).on("delete", function () {
                $(document).trigger("onS3AttachRemoved");
            }).on("error", function(event, id, fileName, errText, xhr) {
            });

            var initial_file_name = $("#initial_file_name").val();
            if (initial_file_name !== undefined){
                s.s3NotesAttachUploader.fineUploader("addInitialFiles", [{"name": initial_file_name}]);
                $("#uploaded_filename i").text(initial_file_name);
            }

        },

        initLoadingDots = function() {
            var x=0;
            setInterval(function() {
                var dots = "";
                x++;
                for (var y=0; y < x%4; y++) {
                    dots += ".";
                }
                $(".loading-dots").text(dots);
            }, 500);
        },

        initDeliveryForm = function() {
            if ($("#no_delivery").length) {
                s.s4ShipmentElements.collapse({
                    toggle: false
                });
            }
            if ( $('input[name=delivery_choice]:checked').val() == "with_delivery" ){
                    s.s4ShipmentElements.addClass("in");
                }

            if ($(".country-select").val() == "US") {
                s.stateSelectField.addClass("ep");
            }
            updateShippingRates();
        },

        initCustomerCompanyForm = function() {
            if ( $('#is_company_order_checkbox').is(':checked') ){
                s.s4CustomerCompanyBlock.addClass("in");
            }

            $('#is_company_order_checkbox').on('ifChecked', function(event){
                $('#is_company_order_checkbox').prop('disabled', true);
                s.s4CustomerCompanyBlock.collapse("show");
                $(document).trigger("isCompanyOrderChecked");
            });

            $('#is_company_order_checkbox').on('ifUnchecked', function(event){
                $('#is_company_order_checkbox').prop('disabled', true);
                s.s4CustomerCompanyBlock.collapse("hide");
                $(document).trigger("isCompanyOrderUnchecked");
            });

            s.s4CustomerCompanyBlock.on('shown.bs.collapse', function(event){
                $('#is_company_order_checkbox').prop('disabled', false);
            });

            s.s4CustomerCompanyBlock.on('hidden.bs.collapse', function(event){
                $('#is_company_order_checkbox').prop('disabled', false);
            });
        },

        showErrors = function(errors) {
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

        destroyFormErrors = function(form) {
            var fields = form.find("textarea, input, span.input").removeClass("error");
            fields.tooltip("destroy");
        },

        setDynamicImgRefresh = function() {
            var refreshId = setInterval(function() {
                var modelsIds = [];
                $(".shipment-base").each(function() {
                    var $this = $(this);
                    if ($this.find(".hidden_thumb").length) {
                        modelsIds.push($this.data("model_id"));
                    }
                });

                if (!modelsIds.length) {
                    clearInterval(refreshId);
                }
                else {
                    $.ajax({
                        type: "GET",
                        url: "/check_rendered_thumbs/",
                        data: {
                            data: JSON.stringify({modelsIds: modelsIds})
                        },
                        success: function(data) {
                            "use strict";
                            var r = data.response,
                                baseModelElem;
                            if (r.success) {
                                $.each(r["models_thumbs"], function(modelId, thumbUrl) {
                                    baseModelElem = $(".shipment-base[data-model_id='" + modelId + "']");

                                    baseModelElem.find(".model_thumb").attr("src", thumbUrl);
                                    baseModelElem.find(".thumb_wrapper, .thumb_wrapper_mini").removeClass("hidden_thumb");
                                })
                            }
                        },
                        error: function(data) {
                            "use strict";
                            log(data);
                        }
                    });
                }
            }, 5000);
        },

        setPricesRefresh = function(emptyPrices) {
            "use strict";
            var refreshId = setInterval(function() {
                $.ajax({
                    type: "GET",
                    url: "/check_prices/",
                    data: {
                        data: JSON.stringify({emptyPrices: emptyPrices})
                    },
                    success: function(data) {
                        var r = data.response,
                            readyModels = [];
                        if (r.success) {
                            if (!r["empty_prices_list"].length) {
                                clearInterval(refreshId);
                            }

                            _.each(r["models_prices"], function(modelDict) {
                                var modelId = modelDict["id"],
                                    allModelPricesCompleted = modelDict["all_prices_finished"],
                                    modelHasAnyPrice = modelDict["any_successful_price"];

                                if (allModelPricesCompleted) {
                                    readyModels.push(modelId);

                                    if (!modelHasAnyPrice) {
                                        updateModelStatus(modelId, "fail")
                                    }
                                    else {
                                        updateModelStatus(modelId, "success")
                                    }
                                }

                                _.each(modelDict["materials"], function(materialDict) {
                                    var materialId = materialDict["id"],
                                        allMaterialPricesCompleted = materialDict["all_prices_finished"],
                                        materialHasAnyPrice = materialDict["any_successful_price"],
                                        minMaterialPrice = materialDict["min_price"],
                                        firstMaterialPriceElem = $(".first_material_price[data-material_id='"+modelId+"_"+materialId+"']"),
                                        firstMaterialPriceValueElem = firstMaterialPriceElem.find(".first_price_value");

                                    // all prices failed or model is too big
                                    if (allMaterialPricesCompleted && !materialHasAnyPrice) {
                                        // so set "Needs check" status under material thumb
                                        firstMaterialPriceElem.find(".first_price_loader").addClass("hidden");
                                        firstMaterialPriceElem.find(".needs_check_text").removeClass("hidden");
                                    }

                                    // if material has at least one price, then show the minimal
                                    if (allMaterialPricesCompleted && minMaterialPrice !== undefined) {
                                        firstMaterialPriceElem.find(".first_price_loader").addClass("hidden");
                                        firstMaterialPriceValueElem.removeClass("hidden");
                                        Common.replaceLocalized(firstMaterialPriceValueElem.find(".any_price"),
                                                                parseFloat(minMaterialPrice).toFixed(2));
                                    }
                                    _.each(materialDict["prices"], function(materialPriceDict) {
                                        var mPriceId = materialPriceDict["cmp_pk"],
                                            mPriceValue = materialPriceDict["price"],
                                            mPriceBlockElem = $(".material_price_block[data-material-price-id='m"+modelId+"_"+mPriceId+"']"),
                                            mPriceValueTextElem = mPriceBlockElem.find(".m_price_value_text");


                                        if (mPriceValue != null) {
                                            mPriceBlockElem.find(".loading-dots").remove();
                                            Common.replaceLocalized(mPriceValueTextElem.find(".any_price"),
                                                                    parseFloat(mPriceValue).toFixed(2));
                                            mPriceValueTextElem.removeClass("hidden");
                                            mPriceBlockElem.find(".increment, .buy_btn").prop("disabled", false);

                                        }
                                        if (materialPriceDict["calc_failed"]) {
                                            mPriceBlockElem.find(".hidden_with_error").addClass("hidden");
                                            mPriceBlockElem.find(".undefined_error").removeClass("hidden");
                                        }
                                    });
                                });
                            });
                            s.s2readyModels = readyModels;
                            $("#ready_models").text(s.s2readyModels.length);
                            updateProgressBar();
                        }
                    },
                    error: function(data) {
                        log(data);
                    }
                });
            }, 3000)
        },

        generateRateElement = function(rateData) {
            var newRate = s.shippingRateTemplate.clone(),
                input = newRate.find("input");
            newRate.removeAttr("id").find(".sh_service").text(rateData["title"]);
            Common.replaceLocalized(newRate.find(".any_price"), rateData["price"]);
            input.attr("id", "rid-"+rateData["rate_id"]).val(rateData["rate_id"]);
            input.attr("data-price", rateData["price"]);
            newRate.find("label").attr("for", "rid-"+rateData["rate_id"]);
            return newRate;
        },

        showDeliveryLoader = function() {
            $(".sh_rate:not(#shipping_rates)").remove();
            s.deliveryInfo.addClass("hidden");
            s.deliveryLoader.removeClass("hidden");
        },

        showDeliveryInfo = function(text, type) {
            var textType = "text-"+s.deliveryInfo.attr("data-type"),
                newTextType;
            if (type) {
                newTextType = "text-"+type;
                s.deliveryInfo.removeClass(textType).addClass(newTextType).attr("data-type", type);
            }
            if (text) {
                s.deliveryInfo.text(text);
            }

            $(".sh_rate:not(#shipping_rates)").remove();
            s.deliveryLoader.addClass("hidden");

            s.deliveryInfo.removeClass("hidden");
        },

        showShippingRates = function(rates) {
            s.deliveryInfo.addClass("hidden");
            s.deliveryLoader.addClass("hidden");
            $(".sh_rate:not(#shipping_rates)").remove();
            $.each(rates, function(i) {
                var rate = generateRateElement(this);
                $("#shipping_rates").append(rate);
                if (i == 0) {
                    rate.find("input").prop("checked", true).change();
                }
            })
        },

        initDeliveryFormTooltips = function() {
            $("select[data-errors]").each(function() {
                $(this).next().find("input").data("errors", $(this).data("errors"));
            });

            $("input.error, .error+.minict_wrapper input").each(function() {
               $(this).tooltip({
                    trigger: "manual",
                    title: $(this).data("errors"),
                    placement: "bottom"
                });
               $(this).tooltip("show");
            });

            $(".ep, .error+.minict_wrapper input").click(function() {
                $(this).next(".tooltip").hide();
            })
        },

        updateCountedPrices = function(prices) {
            _.each(prices, function(cost_value, cost_name) {
                var priceElem = $("#" + cost_name);
                if ((cost_name == "delivery_cost" || cost_name == "startup_cost") && cost_value > 0) {
                    priceElem.removeClass("hidden");
                }
                Common.replaceLocalized(priceElem.find(".any_price"), cost_value.toFixed(2));
            });
        },

        updateShippingRates = function() {

            if ($("#no_delivery").is(":checked") || $("#universal_delivery_price").length) {
                return;
            }

            s.s4CurrentRatesRequestId = Common.getUniqueId();

            var epFields = $(".ep"),
                requiredEpFields = epFields.not(".ep_optional"),
                emptyRequiredEpFields = requiredEpFields.filter(function() {return !$(this).val()});


            if (!emptyRequiredEpFields.length) {
                showDeliveryLoader();
                Cart.updateShippingRates(epFields, s.s4CurrentRatesRequestId).done(function(data){
                    var response = data.response;
                    if (s.s4CurrentRatesRequestId == response["request_id"]) {
                        s.deliveryLoader.addClass("hidden");
                        if (response.success) {
                            if (!response.data.rates.length) {
                                showDeliveryInfo(response.message, 'warning');
                            }
                            else {
                                showShippingRates(response.data.rates);
                            }
                        }
                        else {
                            showDeliveryInfo(response.message, 'danger')
                        }
                    }
                }).error(function(data) {
                    showDeliveryInfo(
                        "Shipment options with current address are not available. " +
                        "Please try another address or continue without shipment and discuss it later", 'info')
                })
            }
        },

        handleMinimumOrderAmount = function(minimum_order_amount, current_order_amount) {
            var btnNextElem = $(".btn-next"),
                invalidMTypesCostWrap = $("#invalid_m_type_cost_msg"),
                systemMessageElem = invalidMTypesCostWrap.closest( ".system-message" );

            if (current_order_amount >= minimum_order_amount) {
                systemMessageElem.addClass("hidden");
                invalidMTypesCostWrap.addClass("hidden");

                // change next step button url
                btnNextElem.removeClass("disabled");
                btnNextElem.attr("disabled", false);
                btnNextElem.attr("href", btnNextElem.data("url"));

                $(".order-steps li:not(.active) a").each(function() {
                    var $this = $(this);
                    $this.attr("href", $this.data("url"));
                })
            }
            else {
                Common.replaceLocalized(invalidMTypesCostWrap.find(".total_cost .any_price"),
                    current_order_amount.toFixed(2));
                Common.replaceLocalized(invalidMTypesCostWrap.find(".price_diff .any_price"),
                    (minimum_order_amount - current_order_amount).toFixed(2));
                Common.replaceLocalized($(".exact_price_diff"),
                    (minimum_order_amount - current_order_amount));
                invalidMTypesCostWrap.removeClass("hidden");
                systemMessageElem.removeClass("hidden");

                // change next step button url
                btnNextElem.addClass("disabled");
                btnNextElem.attr("disabled", true);
                btnNextElem.data("url", btnNextElem.attr("href"));
                btnNextElem.removeAttr("href");

                $(".order-steps li:not(.active) a").each(function() {
                    var $this = $(this);
                    $this.data("url", $this.attr("href"));
                    $this.attr("href", "");
                })
            }
        },

        updateAdditionalCost = function(addCost) {
            var additionalCostWrap = $("#additional_cost_msg"),
                additionalCostMessageElem = additionalCostWrap.closest( ".system-message" );

            if (addCost == 0) {
                additionalCostMessageElem.addClass("hidden");
                additionalCostWrap.addClass("hidden");

            }
            else {
                Common.replaceLocalized(additionalCostWrap.find(".additional_startup_cost .any_price"),
                    addCost.toFixed(2));
                additionalCostWrap.removeClass("hidden");
                additionalCostMessageElem.removeClass("hidden");
            }
        },

        changeActiveModel = function(modelId) {
            var popoverTemplateContent = getTemplatePopoverContent(),
                newActiveStatusBarElem;

            // change active model status bar in content of popover template element
            popoverTemplateContent.find(".uploaded_model_status_bar.active").removeClass("active");
            newActiveStatusBarElem = popoverTemplateContent.find(".uploaded_model_status_bar[data-model_id='" + modelId +"']").addClass("active");

            updatePopoverTemplateContent(popoverTemplateContent);

            //change active model info element
            $(".shipment-base.active").removeClass("active");
            $(".shipment-base[data-model_id='" + modelId +"']").addClass("active");

            // change values related to current model in Manual check request popup
            $("#id_model_id").val(modelId);
            $("#check_request_form_model_title").text(newActiveStatusBarElem.find(".model_title").text());

            // reset uploaded files and FU form
            $("#id_file_path").val("");
            s.s2manualCheckFormFUButton.fineUploader("reset");
            if (!s.s2ModelViewers[modelId].initialized) {
                s.s2ModelViewers[modelId].init();
            }
        },

        swapMenus = function() {
            "use strict";
            var invisibleMenu = $(".dropdown-menu.out_of_screen"),
                visibleMenu = $(".dropdown-menu:not(.out_of_screen)");

            visibleMenu.addClass("out_of_screen");
            invisibleMenu.removeClass("out_of_screen");
        },

        showEmailIsSetMessage = function() {
            "use strict";
            $.fancybox.close(s.s2getUserExtraInfoPopup);
            openGetUserEmailPopup();
            setTimeout(function() {
                $.fancybox.close(s.s2getUserEmailPopup);
            }, 5000);
        },

        bindUIActions = function() {
            var files;

            $(".model_3d_view_switcher").click(function() {
                var $this = $(this),
                    modelId = $this.data("model_id"),
                    mainWrapper = $(".shipment-base[data-model_id='" + modelId + "']");

                mainWrapper.find(".thumb_wrapper").toggleClass("hidden");
                $(this).find("img").toggleClass("hidden");
                mainWrapper.find(".model_3d_preview_controls_explain").toggleClass("hidden");
            });

            s.s2uploadedModelsPopoverViewportElem.on('shown.bs.popover inserted.bs.popover', function (e) {
                var viewportPos = $(s.s2uploadedModelsPopoverViewportElem).position();

                s.s2uploadedModelsPopoverWrapperElem.css("top", (viewportPos.top + 25) + "px");
                s.s2uploadedModelsPopoverWrapperElem.css("left", (viewportPos.left - 20) + "px");
            });

            $(document).on("click", ".uploaded_model_status_bar", function() {
                var _this = $(this),
                    modelId = _this.data("model_id");
                updateSeenModels(modelId);

                // change model title on top of the model info element
                s.s2uploadedModelsPopoverViewportElem.text(_this.find(".model_title").text());
                changeActiveModel(modelId);
            });

            $("textarea, input, span.input").click(function() {
                "use strict";
                $(this).removeClass("error").tooltip("destroy");
            });

            // Add events
            $('input[type=file]').on('change', prepareUpload);

            // Grab the files and set them to our variable
            function prepareUpload(event)
            {
                files = event.target.files;
            }

            // Model amount was changed
            $(".amount").change(function() {
                var orderId = $("#order").val(),
                    itemId = $(this).attr("id"),
                    amount = $(this).val();

                Cart.changeItemAmount(orderId, itemId, amount).done(function(data) {
                    var response = data.response,
                        cartPricesDict;
                    if (response.success) {
                        Common.replaceLocalized($("tr[data-item-id="+itemId+"]").find(".any_price"), response["data"]["item_price"].toFixed(2));
                        cartPricesDict = response["data"]["cart_prices"];
                        updateCountedPrices(response["data"]["cart_prices"]);
                        handleMinimumOrderAmount(
                            cartPricesDict["company_minimum_order"],
                            cartPricesDict["full_models_cost"]);
                    }
                });
            });

            $(".increase-startup-price-link, .remove-startup-price-link").click(function() {
                var orderId = $("#order").val();
                    
                if ($(this).attr("class") == "remove-startup-price-link"){
                    addCost = 0;
                }
                else {
                    addCost = parseFloat($(".exact_price_diff").html().replace(",", "."));
                }
                company = parseInt($("#company").val());

                Cart.changeAdditionalCost(orderId, addCost, company).done(function(data) {
                    var response = data.response,
                        cartPricesDict;
                    if (response.success) {
                        cartPricesDict = response["data"]["cart_prices"];
                        updateCountedPrices(response["data"]["cart_prices"]);
                        handleMinimumOrderAmount(
                            cartPricesDict["company_minimum_order"],
                            cartPricesDict["full_models_cost"]);
                        updateAdditionalCost(response["data"]["add_cost"]);
                    }
                });
            });


            $(".manual_check_popup_btn").click(function() {
                $.fancybox.open($('#manual_check_popup'), {
                    wrapCSS: "global-popup",
                    maxWidth: '90%',
                    maxHeight: '95%',
                    padding: 0,

                    afterLoad: function () {
                        $(document).trigger("onRmcOpen");
                    },
                    afterClose: function () {
                        $(document).trigger("onRmcClose");
                    }
                });
            });

            s.s2checkPasswordPopupFormElem
            .add(s.s2getEmailPopupFormElem)
            .add(s.s2getUserExtraInfoFormElem).keypress(function (e) {
                "use strict";
                if (e.keyCode == 13) {
                    e.preventDefault();
                    $(this).find(".widget_2nd_step_popup_btn").trigger("click");
                }
            });

            $("#skip_extra_info_form").click(function() {
                "use strict";
                showEmailIsSetMessage();
            });

            $("#extra_info_btn").click(function() {
                "use strict";
                var btnElem = $(this),
                    formId = btnElem.data("fid"),
                    formElem = $("#" + formId),
                    userInputElem = formElem.find("#id_user"),
                    formVisibleInputs = formElem.find("input:not([type=hidden])"),
                    formData;
                userInputElem.val(s.s2CreatedUserId);

                formVisibleInputs.each(function(i, elem) {
                    var input = $(elem);
                    if (input.val() == "") {
                        input.attr({
                            "title": "This field cannot be empty",
                            "data-toggle": "tooltip"
                        }).addClass("error");

                        input.tooltip({
                            placement: "bottom",
                            trigger: "manual",
                            animation: true,
                            delay: {"show": 200, "hide": 200}
                        });
                        input.tooltip("show");
                    }
                });

                formData = formElem.serializeArray();
                emailSubmitBtnShowContent(btnElem, "loader");

                $.ajax({
                    type: "POST",
                    url: "/add_user_extra_info/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: formId, formData: formData})
                    },
                    success: function(data) {
                        var r = data.response;

                        emailSubmitBtnShowContent(btnElem, "text");
                        if (r.success) {
                            showEmailIsSetMessage();
                        }
                    },
                    error: function(data) {
                        "use strict";
                        log(data);
                        emailSubmitBtnShowContent(btnElem, "text");
                    }
                });
            });

            $("#set_email").click(function() {
                var btnElem = $(this),
                    formId = btnElem.data("fid"),
                    formElem = $("#" + formId),
                    emailInputElem = formElem.find("input[type=email]"),
                    formData = formElem.serializeArray();

                emailSubmitBtnShowContent(btnElem, "loader");

                $.ajax({
                    type: "POST",
                    url: "/register_or_auth/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: formId, formData: formData})
                    },
                    success: function(data) {
                        "use strict";
                        var r = data.response,
                            emailIsSetText,
                            emailIsSetTextElem = $(".email_is_set_text"),
                            emailIsSetElem = $(".email_is_set_elem");

                        if (!r.success) {
                            showErrors(data.response.errors);
                            emailSubmitBtnShowContent(btnElem, "text");
                        }
                        else if (r.user_status == "created") {
                            s.s2CreatedUserId = r.created_user_id;

                            $("#continue_to_widget").click(function() {
                                $.fancybox.close(s.s2getUserEmailPopup);
                            });
                            settingsGlobal.csrf = r.csrf_token;
                            swapMenus();

                            emailIsSetText = _.template($("#get_email_form_success_text_template").html())({
                                companyName: r.company_name,
                                email: r.email
                            });
                            emailIsSetTextElem.html(emailIsSetText);

                            $.fancybox.close(s.s2getUserEmailPopup);
                            openGetUserExtraInfoPopup();

                            $(".get_email_elem").addClass("hidden");
                            emailIsSetElem.removeClass("hidden");
                        }
                        else if (r.user_status == "exists") {
                            emailSubmitBtnShowContent(btnElem, "text");
                            s.s2checkPasswordPopupFormElem.find("input[type=email]").val(emailInputElem.val());
                            s.s2getEmailPopupFormElem.addClass("hidden");
                            s.s2checkPasswordPopupFormElem.removeClass("hidden");
                        }
                    },
                    error: function(data) {
                        "use strict";
                        log(data);
                        emailSubmitBtnShowContent(btnElem, "text");
                    }
                });
            });

            $("#back_to_email_btn").click(function() {
                "use strict";
                s.s2checkPasswordPopupFormElem.find("input[type=email], input[type=password]").val("");
                s.s2getEmailPopupFormElem.find("input[type=email]").val("");
                destroyFormErrors(s.s2checkPasswordPopupFormElem);
                destroyFormErrors(s.s2getEmailPopupFormElem);
                s.s2checkPasswordPopupFormElem.addClass("hidden");
                s.s2getEmailPopupFormElem.removeClass("hidden");

            });

            $(document).on("click", ".fgt-pass", function(e) {
                e.stopImmediatePropagation();

                var $this = $(this),
                    email = s.s2checkPasswordPopupFormElem.find("input[type=email]").val();

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

            $("#auth_btn").click(function() {
                var btnElem = $(this),
                    formId = btnElem.data("fid"),
                    formElem = $("#" + formId),
                    passwordInputElem = formElem.find("input[type=password]"),
                    formData = formElem.serializeArray();

                emailSubmitBtnShowContent(btnElem, "loader");

                $.ajax({
                    type: "POST",
                    url: "/check_password/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: formId, formData: formData})
                    },
                    success: function(data) {
                        "use strict";
                        log(data);
                        var r = data.response,
                            processedErrors;

                        emailSubmitBtnShowContent(btnElem, "text");

                        if (!r.success) {
                            processedErrors = _.map(data.response.errors, function(item, i) {
                                if (item.key == "check_user_password_form") {
                                    item.key = passwordInputElem.attr("id");
                                    item.desc = item.errors_desc.join();
                                }
                                return item;
                            });
                            showErrors(processedErrors);
                        }
                        else {
                            settingsGlobal.csrf = r.csrf_token;
                            swapMenus();
                            $.fancybox.close(s.s2getUserEmailPopup);
                        }
                    },
                    error: function(data) {
                        "use strict";
                        log(data);
                        emailSubmitBtnShowContent(btnElem, "text");
                    }
                });
            });

            $("#send_feedback").click(function() {
                var btnElem = $(this),
                    formId = btnElem.data("fid"),
                    formData = $("#" + formId).serializeArray();

                $.ajax({
                    type: "POST",
                    url: "/manual_check_request/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: formId, formData: formData})
                    },
                    success: function(data) {
                        if (!data.response.success) {
                            showErrors(data.response.errors);
                        }
                        else {
                            destroyFormErrors($("#"+formId));
                            Common.successBtn(btnElem, "Sent!");
                            $(document).trigger("onRmcSent");
                            setTimeout(function() {
                                $.fancybox.close($('#manual_check_popup'))
                            }, 350)
                        }
                    },
                    error: function(data) {
                    }
                });
            });

            $(".remove_model").click(function() {
                var orderId = $("#order").val(),
                    itemId = $(this).attr("data-item-id"),
                    removingType = $(this).attr("data-remove");

                if (removingType == "cart") {
                    Cart.removeItem(orderId, itemId).done(function(data) {
                        var response = data.response,
                            cartPricesDict = response["data"]["cart_prices"];

                        if (response.success) {
                            $(document).trigger("onRemoveModel");
                            $(".cart-product[data-item-id="+itemId+"] ").remove();
                            updateCountedPrices(cartPricesDict);

                            if (cartPricesDict["models_cost"] == 0) {
                                location.replace(s.s3PreviousStepUrl);
                            }
                            else {
                                handleMinimumOrderAmount(
                                    cartPricesDict["company_minimum_order"],
                                    cartPricesDict["full_models_cost"]);
                            }
                        }
                    });
                }
            });

            // Add model to cart(from step 2)
            $(".buy_btn").click(function() {
                var materialPriceId = $(this).attr("data-material-price-id"),
                    modelId = $(this).attr("data-model-id"),
                    amount = $("#m"+ materialPriceId).val();

                Cart.addItem(materialPriceId, modelId, amount).done(function(data) {
                    log(data);
                    var response = data.response;
                    if (response.success) {
                        $(document).trigger("onAddToCart");
                        $("html, body").animate({scrollTop: $("#models_cost").offset().top}, "slow");
                        var responseData = response["data"],
                            newCartItemsCount = responseData["cart_items_count"],
                            cartFooterPrices = responseData["cart_prices"],
                            selectedMaterialsCount = responseData["selected_materials_count"],
                            popoverTemplateContent = getTemplatePopoverContent();

                        updateCountedPrices(cartFooterPrices);

                        s.cartItemsCounter.removeClass("hidden").find(".count").text(newCartItemsCount);
                        Common.successBtn($(".btn-next"), "", "btn-cart-added");

                        popoverTemplateContent
                            .find("[data-model_id='"+modelId+"'] .selected_materials_count")
                            .text(selectedMaterialsCount);
                        updatePopoverTemplateContent(popoverTemplateContent);
                    }
                });
            });

            // toggle delivery form on step 4
            $("label[for='with_delivery']").click(function() {
                s.s4ShipmentElements.collapse("show");
            });

            // toggle delivery form on step 4
            $("#no_delivery").click(function() {
                s.s4ShipmentElements.collapse("hide");
            });

            $(".country-select").on("change", function(){
                if ($(this).attr("id") == s.s4DeliveryCountrySelectId){
                    if ($(this).val() == "US") {
                        s.s4DeliveryStateSelectWrapper.hide().removeClass("hidden").fadeIn();
                        s.s4DeliveryStateSelectWrapper.find("select").addClass("ep");
                    }
                    else {
                        s.s4DeliveryStateSelectWrapper.addClass("hidden");
                        s.s4DeliveryStateSelectWrapper.find("select").removeClass("ep");
                    }
                }
                if ($(this).attr("id") == s.s4CustomerCompanyCountrySelectId){
                    if ($(this).val() == "US") {
                        s.s4CustomerCompanyStateSelectWrapper.hide().removeClass("hidden").fadeIn();
                    }
                    else {
                        s.s4CustomerCompanyStateSelectWrapper.addClass("hidden");
                    }
                }
            })

            $(document).on("change", ".ep", function() {
                updateShippingRates()
            });

            $(document).on("change", "input[name=ep_rate_id], input[name=custom_shipping_title]", function() {
                $("#id_delivery_price").val($(this).data("price"));
            });
        };

    init();
    };

(function(){
    $(document).ready(function() {
        StepsUIActions();
        accordion(600, 640);

        $('.hide-panel').on('show.bs.collapse', function(){
            $(this).parent('.accordion-panel').addClass('show')
        });

        $('.hide-panel').on('hide.bs.collapse', function(){
            $(this).parent('.accordion-panel').removeClass('show')
        });
    });
})();

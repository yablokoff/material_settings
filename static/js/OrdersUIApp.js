var OrdersUIActions = function() {
    var s = {
            changeStatusUrl: $("[data-change_status_url]").data("change_status_url"),
            changeOrderTaxUrl: $("[data-change_order_tax_url]").data("change_order_tax_url"),
            priceCorrectionRemoveUrl: $("[data-price_correction_remove_url]").data("price_correction_remove_url"),
            saveStatusBtn: $("#save_status_button"),
            currencySign: $("#order_price .added_currency_sign").text(),
            priceCorrectionTemplate: $("#price_correction_template"),
            orderPriceElem: $("#order_price .any_price"),
        },

        init = function() {
            bindUIActions();

            if ($().select2) {
                $('#models_type_to_zip').select2({
                    minimumResultsForSearch: 20
                });
            }
        },

        localMethods = {
            getOrdersListData: function() {
                var statusElem = $(".order_status:checked"),
                    chosenStatusId = statusElem.val(),
                    chosenStatusName = statusElem.data("display_name"),
                    chosenOrdersItems = $(".order_checkbox:checked"),
                    chosenOrdersIds = chosenOrdersItems.map(function(){return $(this).val()}).toArray(),
                    statusesToChange = $(".order_status_title")
                        .filter(function(){
                            return $.inArray($(this).data("order_id").toString(), chosenOrdersIds) >= 0});

                return {statusName: chosenStatusName, statusId: chosenStatusId, ordersIds: chosenOrdersIds, statusesToChange: statusesToChange , checboxes: chosenOrdersItems}
            },

            getSingleOrderData: function() {
                var statusElem = $(".order_status:checked"),
                    chosenStatusId = statusElem.val(),
                    chosenStatusName = statusElem.data("display_name"),
                    chosenOrdersIds = [s.saveStatusBtn.data("order_id")],
                    statusesToChange = $("#order_status");

                return {statusName: chosenStatusName, statusId: chosenStatusId, ordersIds: chosenOrdersIds, statusesToChange: statusesToChange}
            }
        },

        bindUIActions = function() {

            $(".models_to_zip").change(function() {
                if ($(".models_to_zip:checked").length > 0) {
                    $("#run_zipping_btn").prop("disabled", false);
                }
                else {
                    $("#run_zipping_btn").prop("disabled", true);
                }
            });

            $("#run_zipping_btn").click(function() {
                var modelsIds = [];

                $(".models_to_zip:checked").each(function(i, elem) {
                    var val = $(elem).val();
                    if (modelsIds.indexOf(val) == -1) {
                        modelsIds.push(val);
                    }
                });

                toastr["success"]("Archive is preparing");
                $.ajax({
                    type: "POST",
                    url: "/manage/zip_order_models/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({
                            orderId: $("#run_zipping_btn").data("company_order_id"),
                            modelsIds: modelsIds,
                            modelsType: $("#models_type_to_zip").val()
                        })
                    },
                    success: function(data) {
                        var r = data.response,
                            downloadUrl = r["zip_download_url"];
                        if (r.success) {
                            if (!r.async) {
                                toastr["success"]("Archive is ready for download");
                                window.open(downloadUrl);
                            }
                            else {
                                log("async");
                                var interval = setInterval(function() {
                                    $.ajax({
                                        type: "GET",
                                        url: "/manage/check_zipping_progress/",
                                        data: {
                                            data: JSON.stringify({
                                                taskId: r["task_id"]
                                            })
                                        },
                                        success: function(data) {
                                            log(data);
                                            var r = data.response;
                                            if (r["status"] == "SUCCESS") {
                                                clearInterval(interval);
                                                toastr["success"]("Archive is ready for download");
                                                window.open(downloadUrl);
                                            }
                                        },
                                        error: function(data) {
                                            log(data);
                                        }
                                    });
                                }, 4000)
                            }
                        }
                    },
                    error: function(data) {
                        log(data);
                        toastr["error"]("Sorry, an internal server error occurred. We'll fix it soon.");
                    }
                });
            });

            $("#bill_order").click(function () {
                $.ajax({
                    type: "POST",
                    url: "/manage/send_order_invoice/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({orderId: $("#price_correction_button").data("order_id")})
                    },
                    success: function(data) {
                        var type = "success";

                        if (data.response.warning) {
                            type = "warning"
                        }
                        toastr[type](data.response.msg);
                    },
                    error: function(data) {
                        log(data);
                        toastr["error"]("Sorry, an internal server error occurred. We'll fix it soon.");
                    }
                });
            });

            $(document).on("input", ".invoice_settings", function() {
                var invoiceLink = $("#invoice_url"),
                    invoiceUrl = invoiceLink.attr("href").split("?")[0],
                    newUrl = invoiceUrl + "?" + _.map($(".invoice_settings"), function(item) {
                            var $item = $(item);
                            return $item.data("attr_name") + "=" + $item.val();
                        }).join("&");

                invoiceLink.attr("href", newUrl);
            });

            $(document).on("click", ".price_correction_remove", function() {
                var correctionId = $(this).data("correction_id"),
                    correctionItem = $(".correction_item[data-id='" + correctionId + "']");
                log(correctionId);
                $.ajax({
                    type: "POST",
                    url: s.priceCorrectionRemoveUrl,
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({correctionId: correctionId})
                    },
                    success: function(data) {
                        if (data.response.success) {
                            correctionItem.remove();
                            s.orderPriceElem.text(data.response.new_price.toFixed(2));
                        }
                    },
                    error: function(data) {
                        log(data)
                    }
                });
            });

            $("#change_order_tax").submit(function (e) {
                e.preventDefault();
                var orderId = $("#order_tax_change_btn").data("order_id"),
                    newTax = $(this).find("#new_tax").val();

                if (newTax == "") {
                    toastr["error"]("New tax can not be empty");
                }
                else if (newTax > 100 || newTax < 0) {
                    toastr["error"]("New tax must be in range from 0 to 100");
                }
                else if (isNaN(newTax)) {
                    toastr["error"]("New tax must be a number");
                }
                else {
                    $.ajax({
                        type: "POST",
                        url: s.changeOrderTaxUrl,
                        data: {
                            csrfmiddlewaretoken: settingsGlobal.csrf,
                            data: JSON.stringify({newTax: newTax, orderId: orderId})
                        },
                        success: function(data) {
                            log(data);
                            if (data.response.success) {
                                $("#order_tax_value").text(newTax);
                                $("#tax_rate").val(newTax);
                            }
                        },
                        error: function(data) {
                            log(data)
                        }
                    })
                }

            });

            $('.dropdown-price form').on('submit', function(e) {
                e.preventDefault();

                var form = $(this),
                    formInputs = form.find("input"),
                    descriptionField = $(form).find('#description'),
                    appendTarget = $('#price_correction_list'),

                    priceCorrectionUrl = $("[data-price_correction_url]").data("price_correction_url"),
                    signId = form.find('[name="price"]:checked').attr("id"),
                    sign = (signId == 'inc') ? '+' : '-',
                    correctionVal = parseFloat($(form).find('#cost').val()).toFixed(2),
                    comment = descriptionField.val() ? descriptionField.val() : "",
                    orderId = $("#price_correction_button").data("order_id"),
                    correction =  "" + sign + correctionVal,

                    priceCorrectionTemplate = _.template(s.priceCorrectionTemplate.html()),
                    compiledTemp;

                compiledTemp = $(priceCorrectionTemplate({sign: sign, currency_sign: s.currencySign, val: correctionVal, comment: comment}));

                form.parents('.dropdown').removeClass('open');
                formInputs.val("");

                $.ajax({
                    type: "POST",
                    url: priceCorrectionUrl,
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({orderId: orderId, correction: correction, comment: comment})
                    },
                    success: function(data) {
                        if (data.response.success) {
                            var newCorrectionId = data.response.correction_id;

                            s.orderPriceElem.text(data.response.new_price.toFixed(2));
                            compiledTemp.find("a").attr("data-correction_id", newCorrectionId);
                            compiledTemp.attr("data-id", newCorrectionId);

                            appendTarget.append(compiledTemp);
                            appendTarget.removeClass('hidden');
                        }
                    },
                    error: function(data) {
                        log(data)
                    }
                })
            });

            $('.dropdown-tax form').on('submit', function(e) {
                e.preventDefault();

                var form = $(this),
                    changeTaxUrl = $("[data-change_tax_url]").data("change_tax_url"),
                    orderId = $("#tax_button").data("order_id"),
                    taxVal = parseFloat($(form).find('#tax').val());

                $.ajax({
                    type: "POST",
                    url: changeTaxUrl,
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({orderId: orderId, tax: taxVal})
                    },
                    success: function(data) {
                        if (data.response.success) {
                            var newTax = data.response.new_tax.toFixed(2);
                            s.orderPriceElem.text(data.response.new_price.toFixed(2));
                            $("#order_tax").find("span").text(newTax);
                            $("#tax_rate").val(newTax);
                            $(".dropdown-tax").dropdown("toggle");
                        }
                    },
                    error: function(data) {
                        log(data)
                    }
                })
            });

            s.saveStatusBtn.click(function() {
                var d;
                if ($(this).data("order_id")) {
                    d = localMethods.getSingleOrderData();
                }
                else {
                    d = localMethods.getOrdersListData();
                    d.checboxes.prop("checked", false);
                }
                $.ajax({
                    type: "POST",
                    url: s.changeStatusUrl,
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({statusId: d.statusId, ordersIds: d.ordersIds})
                    },
                    success: function(data) {
                        d.statusesToChange.text(d.statusName);
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
        OrdersUIActions();
    });
})();
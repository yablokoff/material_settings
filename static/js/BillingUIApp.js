var settingsBillingApp,
    BillingApp = {

        init: function(){
            settingsBillingApp = {
                stripeData: $("#page-wrapper").data("stripe_data"),
                addCardUrl: $("#page-wrapper").data("add_card_url"),
                activateCardUrl: $("#page-wrapper").data("activate_card_url"),
                systemMessageElem: $("#system_message"),

                addingCardLoader: $("#adding_card_loader"),
                cardSucceedTextElems: $(".card_succeed"),
                cardEmptyTextElem: $("#no_card_text"),
                cardNumberLast4: $("#card_last4"),
                cardNotActivatedElems: $(".card_not_activated"),
                useQuarterlyPayment: $("[data-use_quarterly_payment]").data("use_quarterly_payment") == "False" ? false : true
            };

            if (settingsBillingApp.stripeData !== undefined) {
                settingsBillingApp.systemMessageText = settingsBillingApp.systemMessageElem.find("strong");
                settingsBillingApp.key = settingsBillingApp.stripeData.key;
                settingsBillingApp.stripeFormData = _.omit(settingsBillingApp.stripeData, "key");
                this.initStripeFormHandler();
            }

            var ppPeriodSwitcherElems = $(".pp_period_switcher");
            if (ppPeriodSwitcherElems.length) {
                ppPeriodSwitcherElems.bootstrapSwitch();
            }
            this.bindUiActions();


        },

        showAddingCardLoader: function () {
            settingsBillingApp.cardSucceedTextElems.add(
                settingsBillingApp.cardEmptyTextElem
            ).addClass("hidden");
            settingsBillingApp.addingCardLoader.removeClass("hidden");
        },

        showUpdatedCreditCardNumber: function(last4) {
            settingsBillingApp.addingCardLoader.addClass("hidden");
            settingsBillingApp.cardEmptyTextElem.addClass("hidden");
            settingsBillingApp.cardSucceedTextElems.removeClass("hidden");
            if (last4) {
                settingsBillingApp.cardNumberLast4.text(last4);
            }
        },

        showEmptyCreditCardNumber: function() {
            settingsBillingApp.addingCardLoader.addClass("hidden");
            settingsBillingApp.cardEmptyTextElem.removeClass("hidden");
            settingsBillingApp.cardSucceedTextElems.addClass("hidden");
            settingsBillingApp.cardNumberLast4.empty();
        },

        showNotActivatedCardElems: function () {
            settingsBillingApp.cardNotActivatedElems.removeClass("hidden");
            settingsBillingApp.cardSucceedTextElems.addClass("text-muted");
        },

        hideNotActivatedCardElems: function() {
            $("#not_added_card_message").remove();
            $(".system_message_admin").addClass("warning").removeClass("error");
            settingsBillingApp.cardNotActivatedElems.addClass("hidden");
            settingsBillingApp.cardSucceedTextElems.removeClass("text-muted");
        },

        initStripeFormHandler:  function() {
            var _this = this;
            settingsBillingApp.stripeFormHandler = StripeCheckout.configure({
                key: settingsBillingApp.key,
                token: function (token) {

                    _this.showAddingCardLoader();

                    $.ajax({
                        type: "POST",
                        url: settingsBillingApp.addCardUrl,
                        data: {
                            csrfmiddlewaretoken: settingsGlobal.csrf,
                            data: JSON.stringify({tokenId: token.id})
                        },
                        success: function(data) {
                            var r = data.response;
                            _this.showUpdatedCreditCardNumber(r.last4);
                            if (r.card_not_activated) {
                                toastr["warning"]("Cart is added, but not active.\n Error occurred: " + r.error);
                                _this.showNotActivatedCardElems();
                            }
                            else {
                                toastr["success"]("Credit card added successfully.");
                                _this.hideNotActivatedCardElems();
                            }
                        },
                        error: function(data) {
                            log(data);
                            toastr["error"]("Sorry, an internal server error occurred, while adding credit card. We'll fix it soon.");
                        }
                    });
                }
            });
        },

        switchSavePaymentPeriodBtn: function() {
            "use strict";
            var planWrapper = $(".current_plan");

            if (planWrapper.find(".change_payment_period").hasClass("hidden")) {
                planWrapper.find(".chosen_plan_info").addClass("hidden");
                planWrapper.find(".change_payment_period").show().removeClass("hidden");
            }
            else {
                planWrapper.find(".change_payment_period").hide().addClass("hidden");
                planWrapper.find(".chosen_plan_info").removeClass("hidden");
            }
        },

        bindUiActions: function() {
            var _this = this;

            $(".use_quarterly_payment").on("switchChange.bootstrapSwitch", function(e, use_quarterly_payment) {
                "use strict";
                var planId = $(this).data("plan_id"),
                    planWrapper = $(".pricing_plan_wrapper[data-plan_id='" + planId + "']"),
                    planMonthlyPaymentValue = planWrapper.find(".monthly_payment_value"),
                    planQuarterlyPaymentValue = planWrapper.find(".quarterly_payment_value");

                if (use_quarterly_payment) {
                    planMonthlyPaymentValue.addClass("hidden");
                    planQuarterlyPaymentValue.removeClass("hidden");
                }
                else {
                    planQuarterlyPaymentValue.addClass("hidden");
                    planMonthlyPaymentValue.removeClass("hidden");
                }

                if (use_quarterly_payment !== settingsBillingApp.useQuarterlyPayment && planWrapper.hasClass("current_plan")) {
                    _this.switchSavePaymentPeriodBtn()
                }
                settingsBillingApp.useQuarterlyPayment = use_quarterly_payment;
            });

            $(".change_plan, .change_payment_period").click(function (e) {
                var changePlanModal = $("#change_pricing_plan_modal"),
                    modalLoader = $("#modal_ajax_loader"),
                    newPlanId = $(e.target).data("plan_id"),
                    currentPlanElem = $(".current_plan"),
                    newPlanElem = $(".pricing_plan_wrap[data-plan_id='" + newPlanId + "']"),
                    currentPlanId = currentPlanElem.data("plan_id");

                changePlanModal.modal("toggle");
                modalLoader.removeClass("hidden");
                changePlanModal.find(".modal_msg").html("");

                $("#accept_changing_pricing_plan_btn").data("plan_id", newPlanId);

                $.ajax({
                    type: "POST",
                    url: $("[data-get_invoice_info_url]").data("get_invoice_info_url"),
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({
                            newPlanId: newPlanId,
                            useQuarterlyPayment: $(".use_quarterly_payment[data-plan_id='" + newPlanId + "']").prop("checked")})
                    },
                    success: function(data) {
                        log(data);
                        $("#modal_ajax_loader").addClass("hidden");
                        var r = data.response;
                        if (r.success) {
                           changePlanModal.find(".modal_msg").html(r.change_plan_msg);
                        }
                        else {
                            toastr["warning"](data.response.error);
                        }
                    },
                    error: function(data) {
                        log(data);
                        modalLoader.addClass("hidden");
                        toastr["error"]("Sorry, an internal server error occurred. We'll fix it soon.");
                    }
                });
            });

            $("#accept_changing_pricing_plan_btn").click(function(e) {
                var newPlanId = $(e.target).data("plan_id"),
                    currentPlanElem = $(".current_plan"),
                    newPlanElem = $(".pricing_plan_wrapper[data-plan_id='" + newPlanId + "']"),
                    currentPlanId = currentPlanElem.data("plan_id");

                $.ajax({
                    type: "POST",
                    url: $("[data-change_plan_url]").data("change_plan_url"),
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({
                            newPlanId: newPlanId,
                            currentPlanId: currentPlanId,
                            useQuarterlyPayment: $(".use_quarterly_payment[data-plan_id='" + newPlanId + "']")
                                .prop("checked")
                        })
                    },
                    success: function(data) {
                        log(data);
                        if (data.response.success) {
                            currentPlanElem.removeClass("current_plan");
                            //currentPlanElem.find(".chosen_plan_info").addClass("hidden");
                            newPlanElem.addClass("current_plan");

                            $(".pricing_plan_wrapper").each(function() {
                                    var $this = $(this);
                                    if (parseInt($this.data("plan_id")) < newPlanId) {
                                        $this.find(".change_plan").text("Downgrade").addClass("btn-nobg");
                                    }
                                    else if (parseInt($this.data("plan_id")) > newPlanId) {
                                        $this.find(".change_plan").text("Upgrade").removeClass("btn-nobg");
                                    }
                            });

                            newPlanElem.find(".until").text(data.response.until);
                            $(".buttons:not(.change_payment_period)").removeClass("hidden");
                            newPlanElem.find(".buttons").addClass("hidden");
                            newPlanElem.find(".chosen_plan_info").removeClass("hidden");

                            if (data.response.no_credit_card_redirect_url) {
                                location.replace(data.response.no_credit_card_redirect_url);
                            }
                        }
                        else {
                            toastr["warning"](data.response.error);
                        }
                    },
                    error: function(data) {
                        log(data);
                        toastr["error"]("Sorry, an internal server error occurred. We'll fix it soon.");
                    }
                });
            });

            $("#activate_card_button").click(function() {
                _this.showAddingCardLoader();
                $.ajax({
                    type: "POST",
                    url: settingsBillingApp.activateCardUrl,
                    data: {csrfmiddlewaretoken: settingsGlobal.csrf},
                    success: function(data) {
                        var r = data.response;
                        if (r.success) {
                            toastr["success"]("Credit card activated successfully.");
                            _this.hideNotActivatedCardElems();
                        }
                        else {
                            toastr["warning"]("Cart is not activated.\n Error occurred: " + r.error);
                        }
                        _this.showUpdatedCreditCardNumber();
                    },
                    error: function(data) {
                        log(data);
                        toastr["error"]("Sorry, an internal server error occurred, while adding credit card. We'll fix it soon.");
                        _this.showUpdatedCreditCardNumber();
                    }
                });
            });

            $('#add_credit_card').on('click', function(e) {
                settingsBillingApp.stripeFormHandler.open(settingsBillingApp.stripeFormData);
                e.preventDefault();
            });

        }

};


(function(){
    $(document).ready(function() {
        BillingApp.init();
    });
})();
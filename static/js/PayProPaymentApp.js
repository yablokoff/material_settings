var settingsPayProPaymentApp,
    PayProPaymentApp = {

        init: function(){
            var rootBlockElem = $("#root_block");
            settingsPayProPaymentApp = {
                rootBlockElem: rootBlockElem,
                stripeData: rootBlockElem.data("stripe_data"),
                checkPayProOrderStatus: rootBlockElem.data("check_paypro_order_status"),
                invoiceId: rootBlockElem.data("invoice_id"),
                systemMessageElem: $("#system_message")
            };

            settingsPayProPaymentApp.systemMessageText = settingsPayProPaymentApp.systemMessageElem.find("strong");
            settingsPayProPaymentApp.key = settingsPayProPaymentApp.stripeData.key;
            settingsPayProPaymentApp.stripeFormData = _.omit(settingsPayProPaymentApp.stripeData, "key");
            this.bindUiActions();
            if (settingsPayProPaymentApp.checkPayProOrderStatus == "True") {
                this.initPayProInvoiceStatusChecking();
            }
        },

        initPayProInvoiceStatusChecking: function() {
            var refreshId = setInterval(function() {
                $.ajax({
                    type: "POST",
                    url: window.location.href,
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({
                                invoiceId: settingsPayProPaymentApp.invoiceId,
                                actionName: "get_invoice_status"
                        })
                    },
                    success: function(data) {
                        var r = data.response;
                        if (r.is_paid) {
                            PayProPaymentApp.showSystemMessage("Payment was completed successfully!", "success");
                            PayProPaymentApp.hideSystemMessageLoader();
                            clearInterval(refreshId);
                        }
                        else if (r.error) {
                            PayProPaymentApp.showSystemMessage(r.error, "error")
                        }
                    },
                    error: function(data) {
                        log(data);
                    }
                });
            }, 5000);
        },

        hideSystemMessage: function() {
            settingsPayProPaymentApp.systemMessageElem.addClass("hidden");
        },

        hideSystemMessageLoader: function() {
            settingsPayProPaymentApp.systemMessageElem.find("img").addClass("hidden");
        },

        showSystemMessageLoader: function() {
            settingsPayProPaymentApp.systemMessageElem.removeClass("hidden");
            settingsPayProPaymentApp.systemMessageElem.addClass("default");
            settingsPayProPaymentApp.systemMessageElem.find("img").removeClass("hidden");
        },

        showSystemMessage: function(text, typeClass) {
            settingsPayProPaymentApp.systemMessageText.text(text);
            settingsPayProPaymentApp.systemMessageElem
                .removeClass("default success error info warning")
                .addClass(typeClass)
                .removeClass("hidden");
        },

        handlePaymentBtnState: function(show) {
            "use strict";

            var paymentBtn = $("#pay_via_paypro_btn"),
                btnText = paymentBtn.find(".btn_text"),
                requestLoader = paymentBtn.find(".request_loader");

            if (show == "loader") {
                paymentBtn.addClass("disabled");
                btnText.addClass("hidden");
                requestLoader.removeClass("hidden");
            }
            else if (show == "text") {
                requestLoader.addClass("hidden");
                btnText.removeClass("hidden");
            }
        },

        bindUiActions: function() {
            var _this = this;

            $('#pay_via_paypro_btn').on('click', function() {

                if ($(this).hasClass("disabled")) {
                    return;
                }

                _this.handlePaymentBtnState("loader");

                $.ajax({
                    type: "POST",
                    url: window.location.href,
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({
                            actionName: "create_payment"
                        })
                    },
                    success: function(data) {
                        var r = data.response;

                        if (r.success) {
                            location.replace(r.payment_url);
                        }
                        else {
                            _this.handlePaymentBtnState("text");
                            _this.showSystemMessage(r.error, "error");
                        }
                    },
                    error: function(data) {
                        _this.handlePaymentBtnState("text");
                        _this.showSystemMessage("Sorry, an internal error occurred, we'll fix it soon.");
                        log(data);
                    }
                });
            });

        }

};


(function(){
    $(document).ready(function() {
        PayProPaymentApp.init();
    });
})();

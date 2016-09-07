var settingsStripePaymentApp,
    StripePaymentApp = {

        init: function(){
            var rootBlockElem = $("#root_block");
            settingsStripePaymentApp = {
                rootBlockElem: rootBlockElem,
                stripeData: rootBlockElem.data("stripe_data"),
                checkPaypalOrderStatus: rootBlockElem.data("check_paypal_order_status"),
                invoiceId: rootBlockElem.data("invoice_id"),
                systemMessageElem: $("#system_message")
            };

            settingsStripePaymentApp.systemMessageText = settingsStripePaymentApp.systemMessageElem.find("strong");
            settingsStripePaymentApp.key = settingsStripePaymentApp.stripeData.key;
            settingsStripePaymentApp.stripeFormData = _.omit(settingsStripePaymentApp.stripeData, "key");
            this.initStripeFormHandler();
            this.bindUiActions();
            if (settingsStripePaymentApp.checkPaypalOrderStatus == "True") {
                this.showSystemMessageLoader();
                this.showSystemMessage("Your payment is being processed. Please, wait awhile.", "info");
                this.initPayPalOrderStatusChecking();
            }
        },

        initPayPalOrderStatusChecking: function() {
            var refreshId = setInterval(function() {
                $.getJSON("/manage/check_paypal_order_status/", {invoiceId: settingsStripePaymentApp.invoiceId},
                function(data){
                    var r = data.response;
                    if (r.is_paid) {
                        StripePaymentApp.showSystemMessage("Payment was completed successfully!", "success")
                        StripePaymentApp.hideSystemMessageLoader();
                        clearInterval(refreshId);
                    }
                    else if (r.not_paid_status != "") {
                        if (r.not_paid_status == "Pending") {
                            StripePaymentApp.showSystemMessage("Payment status was set to \"Pending\". You will be notified when it changes.", "warning")
                        }
                        else {
                            StripePaymentApp.showSystemMessage("Payment failed. Seller will conect you soon.", "error")
                        }
                        StripePaymentApp.hideSystemMessageLoader();
                        clearInterval(refreshId);
                    }
                });
            }, 5000);
        },

        hideSystemMessage: function() {
            settingsStripePaymentApp.systemMessageElem.addClass("hidden");
        },

        hideSystemMessageLoader: function() {
            settingsStripePaymentApp.systemMessageElem.find("img").addClass("hidden");
        },

        showSystemMessageLoader: function() {
            settingsStripePaymentApp.systemMessageElem.removeClass("hidden");
            settingsStripePaymentApp.systemMessageElem.addClass("default");
            settingsStripePaymentApp.systemMessageElem.find("img").removeClass("hidden");
        },

        showSystemMessage: function(text, typeClass) {
            settingsStripePaymentApp.systemMessageText.text(text);
            settingsStripePaymentApp.systemMessageElem
                .removeClass("default success error info warning")
                .addClass(typeClass)
                .removeClass("hidden");
        },

        initStripeFormHandler:  function() {
            var _this = this;
            settingsStripePaymentApp.stripeFormHandler = StripeCheckout.configure({
                key: settingsStripePaymentApp.key,
                token: function (token) {
                    _this.hideSystemMessage();
                    _this.showSystemMessageLoader();
                    $.ajax({
                        type: "POST",
                        url: window.location.href,
                        data: {
                            csrfmiddlewaretoken: settingsGlobal.csrf,
                            data: JSON.stringify({tokenId: token.id})
                        },
                        success: function(data) {
                            var r = data.response;
                            if (r.success) {
                                _this.hideSystemMessageLoader();
                                _this.showSystemMessage("Payment is successful.", "success");

                                $("#invoice_is_paid_info").removeClass('hidden');
                                $("#customButton").remove();
                            }
                            else {
                                _this.showSystemMessage(r.error, "error");
                            }
                        },
                        error: function(data) {
                            _this.showSystemMessage("Sorry, an internal error occurred, we'll fix it soon.")
                        }
                    });
                }
            });
        },

        bindUiActions: function() {

            $('#customButton').on('click', function(e) {
                settingsStripePaymentApp.stripeFormHandler.open(settingsStripePaymentApp.stripeFormData);
                e.preventDefault();
            });

        }

};


(function(){
    $(document).ready(function() {
        StripePaymentApp.init();
    });
})();

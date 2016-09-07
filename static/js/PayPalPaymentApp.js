var settingsPayPalPaymentApp,
    PayPalPaymentApp = {

        init: function(){
            if (window.self != top) {
                // check if page inside an iframe and if so, then hide paypal button
                // because it doesn't work
                $("#paypal_pay_form_btn").addClass("hidden");
                $("#payment_page_link").removeClass("hidden");
            }
        }
};


(function(){
    $(document).ready(function() {
        PayPalPaymentApp.init();
    });
})();

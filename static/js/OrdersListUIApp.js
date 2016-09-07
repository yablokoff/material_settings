var OrdersListUIApp = function() {
    var init = function() {
            showOrder();
            bindActions();

        },

        bindActions = function() {
            $(window).bind("hashchange", function() {
                showOrder();
            });
        },

        showOrder = function() {
            var hash = window.location.hash,
                targetElem = $(hash);

            if (hash) {
                $(".collapse").removeClass("in");
                targetElem.click();
                $("html, body").animate({scrollTop: targetElem.offset().top}, "slow");
            }
        };
    init();
};

(function(){
    $(document).ready(function() {
        OrdersListUIApp();
    });
})();
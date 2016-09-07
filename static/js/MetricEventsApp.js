var MetricEventsApp = function() {
    var
        metricLibLoaded = false,
        s1FineUploaderLoaded = false,
        initStarted = false,
        yaCounter = null,
        userParams = null,

        s1Events = {
            modelUnitsChoiceClick: "model_units_change",
            modelUploaded: "model_uploaded",
            modelDeleted: "model_deleted",
            movedNext: "s1_moved_next"
        },

        s2Events = {
            rmcOpen: "rmc_open",
            rmcClose: "rmc_close",
            rmcSend: "rmc_send",
            rmcAttachUploaded: "rmc_attach_uploaded",
            materialChooseClick: "material_choose_click",
            addedToCart: "added_to_cart",
            amount_increased: "s2_amount_increased",
            amount_decreased: "s2_amount_decreased",
            modelPreview3dSwitched: "model_preview_3d_switched",
            movedNext: "s2_moved_next"
        },

        s3Events = {
            amount_increased: "s3_amount_increased",
            amount_decreased: "s3_amount_decreased",
            removedFromCart: "removed_from_cart",
            attachUploaded: "s3_attach_uploaded",
            attachRemoved: "s3_attach_removed",
            addStartupCost: "add_additional_startup_cost",
            removeStartupCost: "remove_additional_startup_cost",
            notesTextareaFocused: "notes_textarea_focused",
            movedNext: "s3_moved_next",
            movedPrev: "s3_moved_prev"
        },

        s4Events = {
            companyOrderChecked: "is_company_order_checked",
            companyOrderUnchecked: "is_company_order_unchecked",
            withDeliveryChosen: "with_delivery_chosen",
            noDeliveryChosen: "no_delivery_chosen",
            movedNext: "s4_moved_next",
            movedPrev: "s4_moved_prev"
        },

        s5Events = {
            orderPlaced: 'order_placed',
            movedPrev: "s5_moved_prev"
        },

        s6Events = {
            finalBtnClicked: "order_finalized"
        },

        globalEvents = {
            languageChange: "language_change",

            invoiceGenerated: "invoice_generated",
            stripeBtnClick: "stripe_button_clicked",
            paypalBtnClick: "paypal_button_clicked",
            robokassaPaymentSuccess: "robokassa_payment_success"
        },

        landingEvents = {
            blogLinkClick: "blog_link_clicked",
            blogPostClick: "blog_post_clicked",
            reviewSwitchClick: "review_switcher_clicked",
            pressHighlightClick: "press_highlight_clicked",
            pricingPeriodClick: "pricing_period_clicked",
            faqHeaderClick: "faq_header_clicked",

            getStartedNavbarClick: "getstarted_navbar_clicked",
            getStartedPricingClick: "getstarted_pricing_clicked",
            getStartedIndexClick: "getstarted_landing_clicked",

            getStartedFormSend: "get_started_form_sent",
            requestDemoFormSend: "request_a_demo_form_sent",
            pricingFormSend: "pricing_get_started_form_sent",
            productFormSend: "product_get_started_form_sent"
        },

        loadYaMetricLib = function () {
            $.getScript("https://mc.yandex.ru/metrika/watch.js", function(){
                metricLibLoaded = true;
                onLoadDispatcher();
            });
        },
    
        onLoadDispatcher = function () {
            var onS1 = $("#s1").length > 0;
            if ( ( (metricLibLoaded && s1FineUploaderLoaded) || (metricLibLoaded && !onS1) ) && !initStarted ){
                initStarted = true;
                init();
            }
        },
    
        sendGoal = function (goalStr) {
            yaCounter.reachGoal(goalStr, userParams);
        },
    
        getCurrentCompanyName = function () {
            var path = $(location).attr("pathname");
            var urlParts = path.split("/");
            var name = urlParts[1];
            var onWidget = (urlParts[2] === "client") || (urlParts[2] === "order");
            if ( (name == "") || (name == undefined) || (name == path) || !onWidget) {
                name = "unknown";
                console.log("Can not resolve company name");
            }
            return name;
        },
    
        init = function () {
            yaCounter = new Ya.Metrika({id: 29374900});
            userParams = {
                company: getCurrentCompanyName()
            };
    
            // If we are on robokassa success redirect page
            var robokassa_redirect = $("#robokassa_success_redirect");
            if (robokassa_redirect.length) {
                yaCounter.reachGoal(globalEvents.robokassaPaymentSuccess, userParams, function () {
                    $(location).attr('href', robokassa_redirect.val());
                });
            }
    
            initEvents();
        },
    
        initEvents = function() {
            //new landing events
            $(".get_started_form").submit(function () {
                if ($(".pricing").length) {
                    sendGoal(landingEvents.pricingFormSend);
                }
                else if ($(".product").length) {
                    sendGoal(landingEvents.productFormSend);
                }
                else{
                    sendGoal(landingEvents.getStartedFormSend);
                }
            });
            $(".request_a_demo_form").submit(function () {
                sendGoal(landingEvents.requestDemoFormSend);
            });
            $(".js-news-lenta-item").click(function () {
                sendGoal(landingEvents.blogPostClick);
            });
            $(".js-blog-link").click(function () {
                sendGoal(landingEvents.blogLinkClick);
            });
            $(".customers__arrow").click(function () {
                sendGoal(landingEvents.reviewSwitchClick);
            });
            $(".press__arrow").click(function () {
                sendGoal(landingEvents.pressHighlightClick);
            });
            $(".pricing-tabs").click(function () {
                sendGoal(landingEvents.pricingPeriodClick);
            });
            $(".js-faq-door").click(function () {
                sendGoal(landingEvents.faqHeaderClick);
            });
            $(".getstarted_btn_header").click(function () {
                sendGoal(landingEvents.getStartedNavbarClick);
            });
            $(".getstarted_btn_pricing").click(function () {
                sendGoal(landingEvents.getStartedPricingClick);
            });
            $(".getstarted_btn_index").click(function () {
                sendGoal(landingEvents.getStartedIndexClick);
            });
            // S1 events getstarted_button_pricing
            if ($("#s1").length){
                $("input[type=radio][name=units]").change(function () {
                    sendGoal(s1Events.modelUnitsChoiceClick);
                });
    
                $(document).on("onUploadComplete", function () {
                    sendGoal(s1Events.modelUploaded);
                });
    
                $(document).on("click", ".qq-upload-delete", function() {
                    sendGoal(s1Events.modelDeleted);
                });
            }
            // S2 events
            if ($("#s2").length){
                $(document).on("onRmcOpen", function () {
                    sendGoal(s2Events.rmcOpen);
                });
    
                $(document).on("onRmcClose", function () {
                    sendGoal(s2Events.rmcClose);
                });
    
                $(document).on("onRmcSent", function () {
                    sendGoal(s2Events.rmcSend);
                });
    
                $(document).on("onRmcAttachUploaded", function () {
                    sendGoal(s2Events.rmcAttachUploaded);
                });
    
                $(".material-list li").click(function () {
                    sendGoal(s2Events.materialChooseClick);
                });
    
                $(document).on("onAddToCart", function () {
                    sendGoal(s2Events.addedToCart);
                });
    
                $('[data-qnt="increment"]').click(function (){
                    sendGoal(s2Events.amount_increased);
                });
    
                $('[data-qnt="decrement"]').click(function (){
                    sendGoal(s2Events.amount_decreased);
                });
    
                $(".model_3d_view_switcher").click(function() {
                    sendGoal(s2Events.modelPreview3dSwitched);
                });
            }
    
            if ($("#s3").length){
                $('[data-qnt="increment"]').click(function (){
                    sendGoal(s3Events.amount_increased);
                });
    
                $('[data-qnt="decrement"]').click(function (){
                    sendGoal(s3Events.amount_decreased);
                });
    
                $(document).on("onRemoveModel", function () {
                    sendGoal(s3Events.removedFromCart);
                });
    
                $(document).on("onS3AttachUploaded", function () {
                    sendGoal(s3Events.attachUploaded);
                });
    
                $(document).on("onS3AttachRemoved", function () {
                    sendGoal(s3Events.attachRemoved);
                });
    
                $(".increase-startup-price-link").click(function() {
                    sendGoal(s3Events.addStartupCost);
                });
    
                $(".remove-startup-price-link").click(function() {
                    sendGoal(s3Events.removeStartupCost);
                });
    
                $("#notes_text").focus(function () {
                    sendGoal(s3Events.notesTextareaFocused);
                });
            }
    
            if ($("#s4").length){
                $(document).on("isCompanyOrderChecked", function () {
                    sendGoal(s4Events.companyOrderChecked);
                });
    
                $(document).on("isCompanyOrderUnchecked", function () {
                    sendGoal(s4Events.companyOrderUnchecked);
                });
    
                $("#with_delivery, #no_delivery").change(function () {
                    if ($("#with_delivery").is(":checked")){
                        sendGoal(s4Events.withDeliveryChosen);
                    }
                    if ($("#no_delivery").is(":checked")){
                        sendGoal(s4Events.noDeliveryChosen);
                    }
                })
            }
    
            if ($("#s5").length){
                $("#place_order_form").submit(function () {
                    sendGoal(s5Events.orderPlaced);
                });
            }
    
            if ($("#s6").length){
                $("#finalize_btn").click(function () {
                    sendGoal(s6Events.finalBtnClicked);
                });
            }
    
            // Global events
            $("#set_lang").submit(function(){
                sendGoal(globalEvents.languageChange);
            });
    
            $(".btn-next").click(function () {
                if ($("#s1").length)
                    sendGoal(s1Events.movedNext);
                else if ($("#s2").length)
                    sendGoal(s2Events.movedNext);
                else if ($("#s3").length)
                    sendGoal(s3Events.movedNext);
                else if ($("#s4").length)
                    sendGoal(s4Events.movedNext);
            });
    
            $(".btn-prev").click(function () {
                if ($("#s2").length)
                    sendGoal(s2Events.movedPrev);
                else if ($("#s3").length)
                    sendGoal(s3Events.movedPrev);
                else if ($("#s4").length)
                    sendGoal(s4Events.movedPrev);
                else if ($("#s5").length)
                    sendGoal(s5Events.movedPrev);
            });
    
    
            $("#gen_invoice").click(function () {
                sendGoal(globalEvents.invoiceGenerated)
            });
    
            $('#customButton').on('click', function() {
                sendGoal(globalEvents.stripeBtnClick)
            });
    
            $('#paypal_pay_form_btn').submit(function() {
                sendGoal(globalEvents.paypalBtnClick)
            });
        };
    
    $(document).on("onFineUploaderLoaded", function(){
        s1FineUploaderLoaded = true;
        onLoadDispatcher();
    });

    loadYaMetricLib();
};

(function(){
    $(document).ready(function() {
        MetricEventsApp();
    });
})();

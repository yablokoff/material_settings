var settingsCompanyCharge,
    CompanyChargeApp = {

        init: function(){
            settingsCompanyCharge = {
                stripeData: $("#page-wrapper").data("stripe_data"),
                addCardUrl: $("#page-wrapper").data("add_card_url"),
                activateCardUrl: $("#page-wrapper").data("activate_card_url"),
                systemMessageElem: $("#system_message"),

                addingCardLoader: $("#adding_card_loader"),
                cardSucceedTextElems: $(".card_succeed"),
                cardEmptyTextElem: $("#no_card_text"),
                cardNumberLast4: $("#card_last4"),
                cardNotActivatedElems: $(".card_not_activated")
            };

            this.bindUiActions();

        },

        bindUiActions: function() {
            var _this = this;

            $(".make_charge").click(function() {
                var $this = $(this),
                    companyId = $this.data("company_id"),
                    loaderImgElem = $("img[data-company_id='"+companyId+"']");
                loaderImgElem.removeClass("hidden");

                $.ajax({
                    type: "POST",
                    url: "/manage/charge_company/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({companyId: companyId})
                    },
                    success: function(data) {
                        log(data);
                        if (data.response.success) {
                            toastr["success"]("Successfully charged $" + data.response.charged_amount);
                            if (data.response.not_paid.length) {
                                toastr["warning"]("Some invoices are not paid.");
                            }
                            else {
                                var currCompanyChargeCell = $("td[data-company_id='"+companyId+"']");
                                $this.remove();
                                currCompanyChargeCell.find(".total_to_pay, .show_invoices_btn").remove();
                                $("#inv_info_"+companyId).remove();
                                currCompanyChargeCell.text("No unpaid invoices");
                            }
                            $.each(data.response.not_paid, function() {
                                $(".unpaid_invoice_info[data-invoice_id='" + this + "'] .is_paid").text("Not paid").addClass("text-danger");
                            });

                            $.each(data.response.paid, function() {
                                $(".unpaid_invoice_info[data-invoice_id='" + this + "'] .is_paid").text("Paid").addClass("text-success");
                            })
                        }
                        else {
                            toastr["warning"](data.response.error);
                        }
                        loaderImgElem.addClass("hidden");
                    },
                    error: function(data) {
                        log(data);
                        toastr["error"]("An internal server error occurred.");
                    }
                });
            });
        }
};


(function(){
    $(document).ready(function() {
        CompanyChargeApp.init();
    });
})();
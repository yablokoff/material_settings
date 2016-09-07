var ClientsUIActions = function() {
    var s = {
            dateRangeFilterElem: $("#date_range_filter")
        },

        init = function() {
            bindUIActions();

            if (s.dateRangeFilterElem.length) {
                s.dateRangeFilterElem.datepicker({
                    format: "dd/mm/yyyy",
                    weekStart: 1,
                    clearBtn: true
                });
            }
        },

        bindUIActions = function() {

            $("#filtering_form").submit(function (e) {
                "use strict";

                var priceFrom = parseFloat(s.priceFromInputElem.val()),
                    priceTo = parseFloat(s.priceToInputElem.val());

                if (!isNaN(priceTo) && !isNaN(priceFrom) && priceTo < priceFrom) {
                    s.priceToInputElem.tooltip({
                        title: "'To' value must be bigger than 'From' value",
                        placement: "bottom",
                        trigger: "manual"
                    });
                    s.priceToInputElem.tooltip("show");
                    e.preventDefault();
                }
            });

            s.dateRangeFilterElem.find(".calendar_addon").click(function () {
                var inputId = $(this).data("input_id"),
                    input = $("input[data-id='" + inputId + "']");
                input.trigger("focus");
            });

            s.dateRangeFilterElem.find("input").change(function () {
                if ($(this).val() != "") {
                    $(".date_period_choices button.active").removeClass("active");
                    $("#real_date_period_choices input[type='radio']").prop("checked", false).change();
                }
            });
        };

    init();
    };

(function(){
    $(document).ready(function() {
        ClientsUIActions();
    });
})();
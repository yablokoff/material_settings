var FiltersUIActions = function() {
    var s = {
      dateRangeFilterElem: $("#date_range_filter"),
      priceFromInputElem: $(".price_from_input"),
      priceToInputElem: $(".price_to_input"),
      selectAllStatusCheckbox: $("#id_status_all"),
      StatusCheckboxes: $(".status_choices input[type='checkbox']"),
      FilteringForm: $("#filtering_form"),
      ObjectsOnPage: $("#objects_on_page_button")
    };
        init = function() {
          bindUIActions();

          if (s.dateRangeFilterElem.length) {
              s.dateRangeFilterElem.datepicker({
                  format: "dd/mm/yyyy",
                  weekStart: 1,
                  clearBtn: true
              });

              s.priceFromInputElem.numeric({negative: false, altDecimal: "," });
              s.priceToInputElem.numeric({negative: false, altDecimal: "," });
          }
        };

        bindUIActions = function() {
          s.priceToInputElem.focus(function() {
              "use strict";
              s.priceToInputElem.tooltip("destroy");
          });

          s.FilteringForm.submit(function(e) {
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

          s.dateRangeFilterElem.find(".calendar_addon").click(function() {
              var inputId = $(this).data("input_id"),
                  input = $("input[data-id='" + inputId + "']");
              input.trigger("focus");
          });

          s.dateRangeFilterElem.find("input").change(function() {
              if ($(this).val() != "") {
                  $(".date_period_choices button.active").removeClass("active");
                  $("#real_date_period_choices input[type='radio']").prop("checked", false).change();
              }
          });

          $(".date_period_choices button").click(function() {
              var $this = $(this),
                  realRadioButtonElem = $("#real_date_period_choices input[value='" + $this.data("choice_value") + "']");

              $(".date_period_choices button.active").removeClass("active");
              $this.addClass("active");

              realRadioButtonElem.prop("checked", true);
              realRadioButtonElem.change();
              s.dateRangeFilterElem.find("input").val("").change();
          });

          s.selectAllStatusCheckbox.change(function() {
              if ($(this).is(":checked")) {
                  s.StatusCheckboxes.prop("checked", true);
              }
              else {
                  s.StatusCheckboxes.prop("checked", false);
              }
          });

          s.StatusCheckboxes.change(function() {
              if (!$(this).is(":checked")) {
                  s.selectAllStatusCheckbox.prop("checked", false);
              }
              else if (s.StatusCheckboxes.length == $(".status_choices input[type='checkbox']:checked").length) {
                  s.selectAllStatusCheckbox.prop("checked", true);
              }
          });

          s.ObjectsOnPage.click(function(){
            var selected_objects_on_page = $(".objects_on_page_choices:checked").val();
            var current_objects_on_page = $("#current_objects_on_page").val();
            var current_url = $("#objects_on_page_selector_url").val();

            if (current_objects_on_page != selected_objects_on_page) {
              $(location).attr('href', current_url + '&objects_on_page=' + selected_objects_on_page)
            };
          });
        };
    init();
};

(function(){
    $(document).ready(function() {
        FiltersUIActions();
    });
})();

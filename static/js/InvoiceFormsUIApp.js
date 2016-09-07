var InvoiceFormsUIActions = function() {
    var s = {
            saveButtons: $(".form_save_btn"),
            customFieldTemplate: $('#custom_field_block_template'),
            addCutomLineBtns: $(".add_custom_line_btn")
        },

        init = function() {
            bindUIActions();
        },

        bindUIActions = function() {
            
            $(document).on("click", "input", function() {
                log('jfioj3rpokro4r');
                $(this).tooltip("destroy");
            });
            
            s.addCutomLineBtns.click(function() {
                var $this = $(this),
                    formId = $this.data("form_id"),
                    formElem = $("#" + formId),
                    exsitingCustomLines = formElem.find(".custom_line"),
                    newId, t, compiled;
                    
                    if (exsitingCustomLines.length) {
                        
                    }
                    
                    t = _.template(s.customFieldTemplate.html());
                    compiled = $(t({line_id: UUID.generate()}));

                    formElem.find(".custom_lines").append(compiled);
                    compiled.fadeIn();
            })
            
            $(document).on("click", ".remove_custom_line", function(e) {
                e.preventDefault();
                
                var customLineId = $(this).data("line_id");
                $(".custom_line[data-line_id='" + customLineId + "']").remove();
                
            })

            s.saveButtons.click(function(e) {
                e.preventDefault();
                
                var btn = $(this),
                    formId = btn.data("fid"),
                    parentForm = $("#" + formId),
                    formData = {},
                    customFieldsData = [],
                    emptyCustomFields = parentForm.find(".custom_line input").filter(function() { return $(this).val() == ""; });
                
                if (emptyCustomFields.length) {
                    emptyCustomFields.tooltip({
                        trigger: "manual",
                        title: "This field is required",
                        placement: "bottom"
                    });
                    emptyCustomFields.tooltip("show");
                    // emptyCustomFields.css("border-bottom", "2px solid red");
                    return;
                }
                
                parentForm.find(".main_lines input").each(function() {
                    var $this = $(this);
                    formData[$this.attr("name")] = $this.val();
                });
                
                parentForm.find(".custom_line").each(function() {
                    var $this = $(this),
                        currentValuesDict = {};
                    $this.find("input").each(function() {
                        currentValuesDict[$(this).attr("name")] = $(this).val();
                    });
                    customFieldsData.push(currentValuesDict);
                })
                formData["custom_fields"] = customFieldsData;
                                        
                $.ajax({
                    type: "POST",
                    url: parentForm.attr("action"),
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify(formData)
                    },
                    success: function(data) {
                        log(data);
                        Common.successBtn(btn, "Saved");
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
        InvoiceFormsUIActions();
    });
})();

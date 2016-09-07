var MaterialsUIActions = function() {
    var s = {
            materialTemplateSelect: $("#material_template"),
            inlinesTemplateWrapper: $("#inline_price_form_template"),
            getFormLoadUrl: $("[data-form_load_url]").data("form_load_url"),
            uploadThumbUrl: $("[data-upload_thumb_url]").data("upload_thumb_url"),
            formWrapper: $("#form_wrapper"),
            materialForm: $("#material_form"),
            pageWrapper: $("#page-wrapper")
        },

        init = function() {
            bindUIActions();

            if ($().select2) {
                $('#material_template').select2({
                    minimumResultsForSearch: 20
                });
            }

            if (s.pageWrapper.data("page_type") == "edit") {
                s.submitUrl = s.pageWrapper.data("submit_url");
                s.formId = s.pageWrapper.data("form_id");
                s.materialType = s.pageWrapper.data("type");
                initAfterFormLoaded();
            }
            else {
                s.materialTemplateSelect.val(s.materialTemplateSelect.find("option")[1].value).change();
            }

        },

        initAfterFormLoaded = function() {
            updateSettingsWithLoadedForm();
            fineUploaderInit();
            // init custom checkboxes as switchers
            Switchery(s.switchers[0]);
        },

        updateSettingsWithLoadedForm = function () {
            var newData = {
                inputParts: $(".input_part"),
                switchers: $(".js-switch"),

                inlinesWrapper: $("#inlines"),
                totalInlinesElem: $("#id_companymaterialprice_set-TOTAL_FORMS"),
                inlinesCount: $(".inline_price").length,
                inlinesTemplateWrapper: $("#inline_price_form_template"),

                materialThumbImg: $("#material_thumb")
            };
            newData.materialId = newData.materialThumbImg.data("mat_id");
            newData.materialThumbImgOldSrc = newData.materialThumbImg.attr("src");
            newData.cancelImageElem = $(".cancel_uploaded_image");
            newData.materialThumbInput = $("#new_thumb_url");

            _.extend(s, newData)
        },

        showErrors = function(errors) {
            _.each(errors, function(err) {
                var field = $("#"+err.key);
                field.attr({
                    "title": err.desc,
                    "data-toggle": "tooltip"
                }).addClass("error")
            });

            var wrongFields = $("input.error");
            wrongFields.tooltip({
                placement: "bottom",
                trigger: "manual",
                animation: true,
                delay: {"show": 200, "hide": 200}
            });
            wrongFields.tooltip("show");
        },

        bindUIActions = function() {

            $("#submit_company_material_type_form").click(function() {
                var btn = $(this),
                    formId = btn.data("id"),
                    parentForm = $("#" + formId),
                    formData = $("form[data-id='" + formId + "']").serializeArray();

                $.ajax({
                    type: "POST",
                    url: "/manage/materials/update_material_type/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: formId, formData: formData})
                    },
                    success: function(data) {
                        var res = data.response;
                        if (res.success) {
                            Common.successBtn(btn, "Saved");
                            setTimeout(function () {
                                $("#myModal").modal('hide');
                            }, 370);
                        }
                        else {
                            log(res);
                        }
                    },
                    error: function(data) {
                        log(data)
                    }
                });
            });

            $("#material_template").change(function() {
                $.ajax({
                    type: "POST",
                    url: s.getFormLoadUrl,
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf, defaultMaterialId: $(this).val()
                    },
                    success: function(data) {
                        s.formWrapper.html(data.response.form);
                        s.inlinesTemplateWrapper.html(data.response.formset_item);

                        s.submitUrl = data.response.submit_url;
                        s.formId = data.response.form_id;
                        s.materialType = data.response.material_type;
                        initAfterFormLoaded();

                        $("#add_inlines").trigger("click");
                    },
                    error: function(data) {
                        log(data)
                    }
                });
            });

            $(".edit_type").click(function() {
                $("#myModal").modal("show").data("focus_to", $(this).data("focus_to"));
            });

            $('#myModal').on('shown.bs.modal', function (event) {
                log(event);
                $("#" + $(event.target).data("focus_to")).focus();

            });

            $("#delete_material_btn").click(function() {
                $("#materialDeleteModal").modal("toggle");
            });

            $("#duplicate_material_btn").click(function() {
                $("#materialDuplicateModal").modal("toggle");
            });

            $(document).on("focusin", "input, span.input", function() {
                $(this).removeClass("error");
                $(this).tooltip("destroy");
            });

            $(document).on("click", ".cancel_uploaded_image a", function () {
                changeThumb(s.materialThumbImgOldSrc, true);
            });

            $(document).on("click", "#add_inlines", function() {
                var t = _.template(s.inlinesTemplateWrapper.html()),
                    compiled = $(t({id: s.inlinesCount, material_id: s.materialId}));
                s.inlinesCount++;
                s.totalInlinesElem.val(s.inlinesCount);
                s.inlinesWrapper.append(compiled);
            });

            $(document).on("click", ".remove_inline", function() {
                var inlineWrapper = $(".inline_price[data-num='" + $(this).data("inline_num") +"']");
                inlineWrapper.remove();
                s.inlinesCount--;
                s.totalInlinesElem.val(s.inlinesCount);
            });

            $(document).on("click", "#material_form_save", function() {
                var btn = $(this),
                    formData = s.materialForm.serializeArray();

                $.ajax({
                    type: "POST",
                    url: s.submitUrl,
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({formId: s.formId, materialType: s.materialType, formData: formData})
                    },
                    success: function(data) {
                        if (!data.response.success) {
                            showErrors(data.response.errors)
                        }
                        else {
                            Common.successBtn(btn, "saved");
                            if (data.response.redirect_url) {
                                document.location.href = data.response.redirect_url;
                            }
                        }
                    },
                    error: function(data) {
                        log(data)
                    }
                });
            });

            $("#duplicate_material_btn_confirm").click(function () {
                $("#materialDuplicateModal").modal('hide');
                $.ajax({
                    type: "POST",
                    url: "/manage/materials/duplicate/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf,
                        data: JSON.stringify({materialId: $("#duplicate_material_btn_confirm").data("material_id")})
                    },
                    success: function(data) {
                        var type = "success";

                        if (data.response.warning) {
                            type = "warning"
                        }
                        toastr[type](data.response.msg);
                    },
                    error: function(data) {
                        log(data);
                        toastr["error"](data.response.error);
                    }
                });
            });
        },

        fineUploaderInit = function() {
            $('#fu_material_thumb').fineUploader({
              template: "qq-simple-thumbnails-template",
              button: $("#fu_upload_mat_thumb"),
              request: {
                endpoint: s.uploadThumbUrl,
                params: {
                    csrfmiddlewaretoken: settingsGlobal.csrf,
                    materialId: s.materialId
                }
              },
              multiple: false,
              validation: {
                  allowedExtensions: ['jpeg', 'jpg', 'gif', 'png']
              }
            }).on('complete', function(event, id, name, response, xhr){
                changeThumb(response["new_thumb_url"]);
                s.materialThumbInput.val(response["new_thumb_admin_url"]);
                $("#fu_material_thumb .qq-upload-list").empty();

            });

            changeThumb = function (newSrc, cancel) {
                cancel = cancel || false;

                s.materialThumbImg.attr("src", newSrc);
                if (cancel) {
                    s.materialThumbInput.val("");
                    s.cancelImageElem.addClass("hidden");
                }
                else {
                    s.cancelImageElem.removeClass("hidden");
                }
            }

        };

    init();
    };

(function(){
    $(document).ready(function() {
        MaterialsUIActions();
    });
})();
var settingUploadModel,
    UploadModelApp = {

        init: function(){
            settingUploadModel = {
                document: $(document),
                alertElem: $("#analysis_failed"),
                systemMessageElem: $(".system-message"),
                nextStepBtnElem: $("#next_step_btn"),
                lastUploadId: 0,
                uploadedFilesStatus: {},
                modelsLimit: 10,
                unexpectedErrorMessage: "Sorry, an internal error occurred, we'll already know it and fix it soon."
            };

            $('body').tooltip({
                selector: '[data-toggle="tooltip"]',
            });

            /*
                uploadedFilesStatus structure
                {
                    <uploadId>: {
                        uploadCompleted: <Boolean>,
                        uploadSuccessful: <Boolean>,
                        failMessage: <String>,
                        uploadedModelsProcessingResults: <List>,
                        fileExt: <String>, // ".zip", ".wrl", etc.
                }
             */

            this.bindUIActions();
            this.fineUploaderInit();
        },

        bindUIActions: function() {
            var that = this;

            settingUploadModel.nextStepBtnElem.click(function(e) {
                e.preventDefault();
                var btnUrl = $(this).attr("href");

                if (that.checkHasAnyUpload() && that.checkAllUploadsCompleted()) {
                    that.setCurrentModelsIds().done(function(data) {
                        if (!data.response["success"]) {
                            that.showAlert("Sorry, something went wrong, refresh page and try again.");
                        }
                        else {
                            window.location.replace(btnUrl);
                        }
                    });
                }
            });
            
            $(document).on("click", ".qq-upload-delete", function(e) {
                var $this = $(this),
                    uploadId = $this.data("upload_id"),
                    modelId = $this.data("model_id"),
                    currentModelsProcessingRes,
                    new_;

                if ($this.hasClass("file_upload_status_bar")) {
                    delete settingUploadModel.uploadedFilesStatus[uploadId];
                    $this.parents(".uploaded_files_bars_wrap").first().fadeOut('fast').remove();
                }
                else {
                    if (modelId !== undefined) {
                        currentModelsProcessingRes = settingUploadModel.uploadedFilesStatus[uploadId].uploadedModelsProcessingResults;
                        new_ = _.without(currentModelsProcessingRes, _.findWhere(currentModelsProcessingRes, {"model_id": modelId}));
                        settingUploadModel.uploadedFilesStatus[uploadId].uploadedModelsProcessingResults = new_;
                    }

                    var modelFileStatusBar = $this.parents(".processed_model_bar").first();
                    log(modelFileStatusBar.siblings(".processed_model_bar").length);
                    if (!modelFileStatusBar.siblings(".processed_model_bar").length) {
                         $this.parents(".uploaded_files_bars_wrap").first().fadeOut('fast').remove();
                    }
                    else {
                        modelFileStatusBar.fadeOut('fast').remove();
                    }
                }

                that.handleStateOfNextStepBtn();
                that.handleStateOfUploadButtonText();
                that.handleStateUnitChoices();
            });
        },

        setCurrentModelsIds: function() {
            var uploadedModelsIds = _.map(this.getUploadedModelsProcessingResults(), function(item) {
                if (item["success"])
                    return item["model_id"];
            });

            return $.ajax({
                type: "POST",
                url: "/set_current_models_ids/",
                data: {
                    csrfmiddlewaretoken: settingsGlobal.csrf,
                    data: JSON.stringify({modelsIds: uploadedModelsIds})
                }
            });
        },

        showAlert: function(msg) {
            if (msg)
                settingUploadModel.systemMessageElem.find("strong").text(msg);
                settingUploadModel.systemMessageElem.removeClass("hidden");
        },

        initNewUpload: function(uploadId) {
            settingUploadModel.lastUploadId = uploadId;
            settingUploadModel.uploadedFilesStatus[uploadId] = {
                uploadCompleted: false,
                uploadedModelsProcessingResults: []
            };
            return settingUploadModel.lastUploadId;
        },

        checkHasAnyUpload: function() {
            return !$.isEmptyObject(settingUploadModel.uploadedFilesStatus)
        },

        checkAllUploadsCompleted: function() {
            return _.all(settingUploadModel.uploadedFilesStatus, function (uploadRes) {
                return uploadRes.uploadCompleted
            });
        },

        markUploadCompleted: function(uploadId, uploadRes) {
            "use strict";
            var success = uploadRes["success"] || false,
                currentUploadStatus = settingUploadModel.uploadedFilesStatus[uploadId];

            currentUploadStatus.uploadCompleted = true;
            currentUploadStatus.uploadSuccessful = success;
            currentUploadStatus.fileExt = uploadRes["file_ext"];

            if (success) {
                currentUploadStatus.uploadedModelsProcessingResults = uploadRes["models_processing_results"];
            }
            else {
                currentUploadStatus.uploadedModelsProcessingResults = [];
                currentUploadStatus.failMessage = uploadRes["message"] || settingUploadModel.unexpectedErrorMessage;
            }
        },

        showFailedUploadStatus: function(uploadStatusBarElem, uploadRes) {
            uploadStatusBarElem.find(".fail span").attr("title", uploadRes.failMessage);
            uploadStatusBarElem.find(".fail").removeClass("hidden");
        },

        handleStateOfUploadedModelStatusBar: function(uploadId) {
            "use strict";
            var createdStatusBarElem = $(".qq-file-id-" + uploadId),
                uploadRes = settingUploadModel.uploadedFilesStatus[uploadId],
                processedModelTemplate = $("#processed_model_bar_template").html(),
                modelsProcessingResultsCount = uploadRes.uploadedModelsProcessingResults.length;

            // got zip with 1 or more stl files
            if (modelsProcessingResultsCount > 1 ||
                (modelsProcessingResultsCount == 1 && uploadRes.fileExt == ".zip")) {

                createdStatusBarElem.find(".loaded").removeClass("hidden");

                _.each(uploadRes.uploadedModelsProcessingResults, function(item) {
                    var compiled = _.template(processedModelTemplate),
                        rendered = compiled({
                            "message": item["message"] || "",
                            "model_id": item["model_id"],
                            "model_title": item["model_title"],
                            "model_status": item["success"],
                            "upload_id": uploadId
                    });
                    createdStatusBarElem.append(rendered);
                });
            }
            // got single model file
            else if (modelsProcessingResultsCount == 1) {
                var uploadedModelRes = _.first(uploadRes.uploadedModelsProcessingResults),
                    deleteBtnElem = createdStatusBarElem.find(".qq-upload-delete");

                if (uploadedModelRes.success) { //   model processing is successful
                    deleteBtnElem.data("model_id", uploadedModelRes["model_id"]);
                    createdStatusBarElem.data("model_id", uploadedModelRes["model_id"]);
                    createdStatusBarElem.find(".loaded").removeClass("hidden");
                }
                else { // model processing is failed
                       // then show error message from model processing
                    this.showFailedUploadStatus(createdStatusBarElem, {failMessage: uploadedModelRes.message});
                }
            }
            else { // got UploadRes with empty list of results of models processing
                   // some upload errors were occurred, so show message
                this.showFailedUploadStatus(createdStatusBarElem, uploadRes);
            }

            createdStatusBarElem.find(".file_upload_status_bar").data("upload_id", uploadId);
            createdStatusBarElem.find(".qq-progress-bar-container-selector").addClass("hidden");
            createdStatusBarElem.find(".after_upload_status_wrapper").removeClass("hidden");
        },


        handleStateOfNextStepBtn: function() { 
            if (this.checkAllUploadsCompleted() && this.checkHasAnyUpload()){
                settingUploadModel.nextStepBtnElem.removeClass("disabled");
                Common.successBtn(settingUploadModel.nextStepBtnElem);
            }
            else {
                settingUploadModel.nextStepBtnElem.addClass("disabled");
            }
        },

        handleStateOfUploadButtonText: function() {
            "use strict";
            if (_.isEmpty(settingUploadModel.uploadedFilesStatus)) {
                $("#initial_btn_text").removeClass("hidden");
                $("#secondary_btn_text").addClass("hidden");
            }
            else {
                $("#initial_btn_text").addClass("hidden");
                $("#secondary_btn_text").removeClass("hidden");

            }
        },
        
        handleStateUnitChoices: function() {
            if (_.isEmpty(settingUploadModel.uploadedFilesStatus)) {
                $("[name='units']").prop("disabled", false);
            }
        },

        getUploadedModelsProcessingResults: function() {
            "use strict";
            return _.flatten(_.map(settingUploadModel.uploadedFilesStatus, function(uploadRes) {
                return uploadRes.uploadedModelsProcessingResults;
            }));
        },
        
         getSuccessfullyProcessedModelsResults: function() {
            "use strict";
            return _.filter(this.getUploadedModelsProcessingResults(), function(modelProcessingRes) {
                return modelProcessingRes.success
            })
        },

        fineUploaderInit: function() {
            var that = this;
            var up = $("#upload_model").fineUploader({
                debug: false,
                progressBar: true,
                validation: {
                    allowedExtensions:  ['stl', 'obj', 'wrl', 'zip'],
                    sizeLimit: 104857600
                },
                showMessage: that.showAlert,
                messages: {
                    sizeError: "{file} is too big, maximum file size is 100.0 MB.",
                    emptyError: "{file} is empty, please, try another file.",
                    typeError: "{file}: Wrong file extension. Uploads available only for {extensions} files.",
                    noFilesError: "No files to upload"
                },
                request: {
                    endpoint: window.location.pathname
                },
                deleteFile: {
                    enabled: false,
                    method: "POST",
                    endpoint: "/remove_uploaded/"
                }
            }).on("submit", function(event, id, fileName) {

                    settingUploadModel.systemMessageElem.addClass("hidden");
                    settingUploadModel.nextStepBtnElem.addClass("disabled");

                    if (that.getSuccessfullyProcessedModelsResults().length < settingUploadModel.modelsLimit) {
                        that.initNewUpload(id);
                        up.fineUploader('setParams', {
                            csrfmiddlewaretoken: settingsGlobal.csrf,
                            chosenUnits: $("[name='units']:checked").val(),
                            widgetSessionId: $("#s1").data("widget_session_id")
                        });

                        $("[name='units']").prop("disabled", true);
                        that.handleStateOfUploadButtonText();
                    }
                    else {
                        that.showAlert("Models limit exceeded. Maximum " + settingUploadModel.modelsLimit + " models at one time.");
                        that.handleStateOfNextStepBtn();
                        return false;
                    }


            }).on('complete', function(event, id, fileName, responseJSON, xhr) {
                "use strict";
                that.markUploadCompleted(id, responseJSON);
                that.handleStateOfUploadedModelStatusBar(id);

                that.handleStateOfNextStepBtn();
                $(document).trigger("onUploadComplete", null);
            }).on("error", function(event, id, fileName, errText, xhr) {
                "use strict";
                var uploadRes;

                try {
                    uploadRes = JSON.parse(xhr.response);
                }
                catch (err) {
                    uploadRes = {
                        success: false
                    }
                }

                that.markUploadCompleted(id, uploadRes);
                that.handleStateOfUploadedModelStatusBar(id);

                that.handleStateOfNextStepBtn();
                that.handleStateOfUploadButtonText();

            }).on("click", function() {
                settingUploadModel.systemMessageElem.addClass("hidden");
            });
            $(document).trigger("onFineUploaderLoaded", null);
        }
};


(function(){
    $(document).ready(function() {
        UploadModelApp.init();
    });
})();
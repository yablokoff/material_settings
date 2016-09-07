var MaterialsUIActions = function() {
    var init = function() {
            bindUIActions();
        },

        bindUIActions = function() {
            var changedMaterials = {};
            $(document).on("input", ".position", function() {
                var $this = $(this);
                changedMaterials[$this.data("mat_id")] = $this.val();

                $.ajax({
                    type: "POST",
                    url: "/manage/unload/",
                    data: {
                        csrfmiddlewaretoken: settingsGlobal.csrf, data: JSON.stringify(changedMaterials)
                    },
                    success: function(data) {
                        log(data);
                    },
                    error: function(data) {
                        log(data)
                    }
                });
            });

            $(".delete_material_from_list").click(function(e) {
                e.preventDefault();
                var url = $(this).data("material_deletion_url"),
                    deletionModal = $("#materialDeleteModal");
                deletionModal.find("form").attr("action", url);
                deletionModal.modal("toggle");
            })
        };

    init();

    };

(function(){
    $(document).ready(function() {
        MaterialsUIActions();
    });
})();
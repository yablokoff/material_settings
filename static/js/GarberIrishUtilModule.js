var UTIL = (function() {

    var namespase,
        local = {
          exec: function(controller, action) {
                action = ( action === undefined ) ? "init" : action;

                if ( controller !== "" && namespase[controller] && typeof namespase[controller][action] == "function" ) {
                    namespase[controller][action]();
                }
          }
        };

    return {

        init: function(ns) {
            namespase = ns;
            var body = $(document.body),
                controller = body.data("controller"),
                action = body.data("action");

            local.exec("common");
            local.exec(controller);
            local.exec(controller, action);
        }
    }
}());
var Cart = (function() {

    var local = {
            sendCartRequest:  function (requestData, actionType, method) {
                var method = method || "POST",
                    url = "/cart/"+actionType+"/";

                //log(JSON.stringify(requestData));

                return $.ajax({
                  type: method,
                  url: url,
                  data: {
                      csrfmiddlewaretoken: settingsGlobal.csrf,
                      data: JSON.stringify(requestData)
                  }
                });
            }
        };

    return {

        addItem: function(materialPriceId, modelId, amount) {
            var requestData = {
                    model_id: modelId,
                    material_price_id: materialPriceId,
                    amount: amount
                };
            return local.sendCartRequest(requestData, "add");
        },

        changeItemAmount: function(orderId, itemId, amount) {
            var requestData = {
                    itemId: itemId,
                    newAmount: amount,
                    orderId: orderId || undefined
                };

            return local.sendCartRequest(requestData, "change");
        },

        removeItem: function(orderId, itemId) {
            var requestData = {
                    itemId: itemId,
                    orderId: orderId || undefined
                };

            return local.sendCartRequest(requestData, "remove");
        },

        changeAdditionalCost: function(orderId, addCost, company) {
            var requestData = {
                    addCost: addCost,
                    company: company,
                    orderId: orderId || undefined
                };

            return local.sendCartRequest(requestData, "addStartupCost");
        },

        updateShippingRates: function(jqFields, id) {
            var requestData = {
                fields: {},
                id: id
            };
            jqFields.each(function() {
                var jqItem = $(this);
                requestData.fields[jqItem.attr("name")] = jqItem.val()
            });

            return local.sendCartRequest(requestData, "rates");
        }
    }
}());
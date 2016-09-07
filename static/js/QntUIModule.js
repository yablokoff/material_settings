// Counter

var Qnt = {
    changePriceValue: function(materialPriceId, newAmount) {

        var priceWrapElem = $(".rw[data-material-price-id='" + materialPriceId + "']");

        if (priceWrapElem.length) {
            var priceValueWrapElem = priceWrapElem.find(".m_price_value"),
                priceValueElem = priceValueWrapElem.find(".any_price"),
                priceValuePerItem = priceValueWrapElem.data("m-price-value"),
                newValue = (newAmount * parseFloat(priceValuePerItem.toString().replace(",", "."))).toFixed(2);
            Common.replaceLocalized(priceValueElem, newValue);
        }

    },

    increment: function (e) {
        var siblButton = $(this).siblings('button')[0];
        var input = $(this).siblings('input')[0],
            materialPriceId = $(input).attr("id");
        var value = $(input).val();
        var new_val = parseInt(value, 10) + 1;

        $(siblButton).removeAttr('disabled');

        if (isNaN(new_val)) {
            $(input).val(1).change();
            Qnt.changePriceValue(materialPriceId, 1);
            $(siblButton).attr('disabled', 'disabled');

            return false
        }
        $(input).val(new_val).change();
        Qnt.changePriceValue(materialPriceId, new_val);

        e.preventDefault();
    },

    decrement: function (e) {
        var input = $(this).siblings('input')[0],
            materialPriceId = $(input).attr("id");
        var value = $(input).val();
        var new_val = parseInt(value, 10) - 1;

        if (isNaN(value)) {
            $(input).val(1).change();
            Qnt.changePriceValue(materialPriceId, 1);
            $(this).attr('disabled', 'disabled');

            return false
        } else if (value == 2 || value < 2) {
            $(input).val(1).change();
            Qnt.changePriceValue(materialPriceId, 1);
            $(this).attr('disabled', 'disabled');
        } else {
            $(input).val(new_val).change();
            Qnt.changePriceValue(materialPriceId, new_val);
        }

        e.preventDefault();
    },

    disableDecrBtns: function() {
        $(".qnt-wrap").each(function(i, item){
            var currentDecrBtn = $(this).find("button[data-qnt='decrement']");
            if ($(this).find("input").val() < 2) {
                $(currentDecrBtn).attr('disabled', 'disabled');
            }
        });
    },

    init: function (defaultV, minV) {
        Qnt.disableDecrBtns();
        this.incBtn = $('[data-qnt="increment"]');
        this.decrBtn = $('[data-qnt="decrement"]');

        this.incBtn.click(Qnt.increment);
        this.decrBtn.click(Qnt.decrement);
    }
};

(function(){
    $(document).ready(function() {
        Qnt.init();
    });
})();
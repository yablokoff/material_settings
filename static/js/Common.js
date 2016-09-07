var Common = (function() {

    return {

        capitalizeFirst: function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        getUniqueId: function () {
            return '_' + Math.random().toString(36).substr(2, 9);
        },

        successBtn: function(btn, text, className) {
            var oldText = btn.text(),
                className = className || "btn-success";

            btn.attr("disabled", true).addClass(className);
            if (text) {
                btn.text(text);
            }

            setTimeout(function () {
                btn.removeClass(className).attr("disabled", false);
                if (text) {
                    btn.text(oldText);
                }
            }, 3000);
        },

        replaceLocalized: function (textElem, number) {
            if (textElem.text().indexOf(".") != -1) {
                textElem.text(number.toString().replace(",", "."));
            }

            if (textElem.text().indexOf(",") != -1) {
                textElem.text(number.toString().replace(".", ","));
            }
        }
    }
}());
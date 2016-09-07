var ls = (function() {

    return {
        getItem: function (key) {
            return JSON.parse(localStorage.getItem(key));
        },

        setItem: function(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
}());
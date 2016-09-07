(function() {

    function extend(obj, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) obj[key] = src[key];
        }
        return obj;
    }

    var settings,
        _this = this,
        newElemsIds = {
            overlay: "df-widget-overlay",
            body: "df-widget-body",
            popupWrap: 'df-widget-popup-wrap',
            buttonWrap: "df-widget-btn",
            buttonCircle: "df-widget-btn-circle",
            buttonText: "df-widget-btn-text"
        },

        methods = {

            init: function() {
                methods.initGetOuterHTMLFunction();
                settings = {
                    companyWidgetUrl: __digifabsterCompanyWidgetUrl,
                    siteUrl: __digifabsterSiteUrl,
                    btnType: __digifabsterBtnType,
                    langCode: __digifabsterWidgetLangCode,
                    btnLocalizedTitleDict: {
                        "ru": "узнать цену 3d печати",
                        "default": "get a 3d print quote"
                    }
                };


                if (_this.__digifabsterOverrideTitleDict && typeof _this.__digifabsterOverrideTitleDict === 'object') {
                        settings["btnLocalizedTitleDict"] =
                            extend(settings["btnLocalizedTitleDict"], __digifabsterOverrideTitleDict);
                    }

                methods.initLightBox();
                methods["init" + methods.capitalizeFirst(settings.btnType) +  "Button"]();

                settings["popupWrap"] = document.getElementById(newElemsIds.popupWrap);
                settings["overlayElem"] = document.getElementById(newElemsIds.overlay);
                settings["bodyElem"] = document.getElementById(newElemsIds.body);
                settings["closeWidgetElems"] = document.getElementsByClassName("df-widget-close");

                methods.bindUIActions();
            },

            capitalizeFirst: function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            },

            __getBtnTitleLocalized: function() {
                return settings.btnLocalizedTitleDict[settings.langCode] || settings.btnLocalizedTitleDict["default"]
            },

            __setCss: function(element, css) {
                var cssText = "";
                for (cssKey in css) {
                    if (css.hasOwnProperty(cssKey))
                        cssText += cssKey + ": " + css[cssKey] + "; ";
                }
                element.style.cssText = cssText;
            },

            initGetOuterHTMLFunction: function() {
                if (!('outerHTML' in document.documentElement)) {
                    methods.__getOuterHTML = function (element) {
                        var _ = document.createElement('html');
                        _.appendChild(element.cloneNode(true));
                        return _.innerHTML;
                    }
                }
                else{
                    methods.__getOuterHTML = function (element) {
                        return element.outerHTML;
                    }
                }
            },

            initFloatButton: function() {
                var buttonWrapper = document.createElement('div'),
                    buttonInnerHTML =
                        '<div id=\"' + newElemsIds.buttonText + '\"><span>' + methods.__getBtnTitleLocalized() + '</span></div>' +
                        '<div></div>' +
                        '<div id=\"' + newElemsIds.buttonCircle + '\">' +
                            '<img src=\"' + settings.siteUrl + '/static/img/cloud_btn.png\">' +
                        '</div>';

                buttonWrapper.innerHTML = buttonInnerHTML;
                buttonWrapper.id = newElemsIds.buttonWrap;
                methods.__setCss(buttonWrapper, {
                    'position': 'fixed',
                    'z-index': '9996',
                    'right': 0,
                    'bottom': 0,
                    'margin': '0 20px 20px 0'
                });

                methods.__setCss(buttonWrapper.getElementsByTagName('span')[0], {
                    'position': 'relative',
                    'color': '#000'
                });

                methods.__setCss(buttonWrapper.getElementsByTagName('div')[0], {
                    //'width': '200px',
                    'padding': '0 10px',
                    'float': 'left',
                    'background-color': '#ffffff',
                    'border-radius': '4px',
                    'text-align': 'center',
                    'font-weight': 'bold',
                    'font-size': '16px',
                    'line-height': '25px',
                    'margin-top': '19px',
                    'text-transform': 'uppercase',
                    'font-family': 'Arial',
                    'cursor': 'pointer',
                    'box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-webkit-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-moz-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-o-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)'
                });

                methods.__setCss(buttonWrapper.getElementsByTagName('div')[1], {
                    'border-width': '4px',
                    'border-style': 'solid',
                    'border-color': 'transparent transparent rgb(255,255,255) rgb(255,255,255)',
                    'border-left-color': '#ffffff',
                    'margin-top': '28px',
                    'margin-left': '-4px',
                    'transform': 'rotate(225deg)',
                    '-webkit-transform': 'rotate(225deg)',
                    '-moz-transform': 'rotate(225deg)',
                    '-o-transform': 'rotate(225deg)',
                    'float': 'left',
                    'box-shadow': '-2px 2px 3px 0px rgba(0,0,0,0.3)',
                    '-webkit-shadow': '-2px 2px 3px 0px rgba(0,0,0,0.3)',
                    '-moz-shadow': '-2px 2px 3px 0px rgba(0,0,0,0.3)',
                    '-o-shadow': '-2px 2px 3px 0px rgba(0,0,0,0.3)'
                });

                methods.__setCss(buttonWrapper.getElementsByTagName('div')[2], {
                    'width': '60px',
                    'height': '60px',
                    'float': 'left',
                    'margin-left': '5px',
                    'background-color': '#0071b2',
                    'border-radius': '50%',
                    'text-align': 'center',
                    'cursor': 'pointer',
                    'box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-webkit-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-moz-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-o-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)'
                });

                methods.__setCss(buttonWrapper.getElementsByTagName('img')[0], {
                    'width': '38px',
                    'display': 'inline-block',
                    'margin-top': '16px'
                });

                document.body.appendChild(buttonWrapper);
            },

            initLeftfloatButton: function() {
                var buttonWrapper = document.createElement('div'),
                    buttonInnerHTML =
                        '<div id=\"' + newElemsIds.buttonCircle + '\">' +
                            '<img src=\"' + settings.siteUrl + '/static/img/cloud_btn.png\">' +
                        '</div>' +
                        '<div id=\"' + newElemsIds.buttonText + '\"><span>get a 3d print quote</span></div>';

                buttonWrapper.innerHTML = buttonInnerHTML;
                buttonWrapper.id = newElemsIds.buttonWrap;
                methods.__setCss(buttonWrapper, {
                    'position': 'fixed',
                    'z-index': '9996',
                    'bottom': 0,
                    'margin': '0 20px 20px 0'
                });

                methods.__setCss(buttonWrapper.getElementsByTagName('span')[0], {
                    'position': 'relative',
                    'color': '#000'
                });

                methods.__setCss(buttonWrapper.getElementsByTagName('div')[0], {
                    'width': '60px',
                    'height': '60px',
                    'float': 'left',
                    'margin-left': '5px',
                    'margin-right': '10px',
                    'background-color': '#0071b2',
                    'border-radius': '50%',
                    'text-align': 'center',
                    'cursor': 'pointer',
                    'box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-webkit-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-moz-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-o-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)'
                });

                methods.__setCss(buttonWrapper.getElementsByTagName('div')[1], {
                    'width': '200px',
                    'float': 'left',
                    'background-color': '#ffffff',
                    'border-radius': '4px',
                    'text-align': 'center',
                    'font-weight': 'bold',
                    'font-size': '16px',
                    'line-height': '25px',
                    'margin-top': '19px',
                    'text-transform': 'uppercase',
                    'font-family': 'Arial',
                    'cursor': 'pointer',
                    'box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-webkit-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-moz-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)',
                    '-o-box-shadow': '0px 0px 3px 1px rgba(0,0,0,0.3)'
                });

                methods.__setCss(buttonWrapper.getElementsByTagName('img')[0], {
                    'width': '38px',
                    'display': 'inline-block',
                    'margin-top': '16px'
                });

                document.body.appendChild(buttonWrapper);
            },

            initStaticButton: function() {
                var buttonWrapper = document.getElementById(newElemsIds.buttonWrap);

                buttonWrapper.innerHTML = '<img src=\"' + settings.siteUrl + '/static/img/cloud_btn.png\">' +
                                           '<span>Order a 3D Print Now</span>';

                methods.__setCss(buttonWrapper.getElementsByTagName('img')[0], {
                    'width': '30px',
                    'margin-right': '10px',
                    'float': 'left'
                });

                methods.__setCss(buttonWrapper, {
                    'background': '#0081d4',
                    'border-radius': '20px',
                    'font': 'bold 14px/1.6 \'Arial\'',
                    'color': '#ffffff',
                    'text-transform': 'uppercase',
                    'padding': '9px 16px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'letter-spacing': '.8px',
                    'display': 'inline-block',
                    'transition': 'all 0.2s ease 0s'
                });

            },

            initLightBox: function () {
                var body = document.body,
                    popupWrapper = document.createElement('div'),
                    overlay = document.createElement('div'),
                    popupWrapperStyle = {
                        'display': 'none',
                        'position': 'fixed',
                        'z-index': '9999',
                        'width': '100%',
                        'height': '100%',
                        'top': 0,
                        'left': 0
                    },
                    overlayStyle = {
                        'display': 'none',
                        'position': 'fixed',
                        'top': 0,
                        'left': 0,
                        'width': '100%',
                        'height': '100%',
                        'background-color': '#000000',
                        'opacity': '.7',
                        'z-index': '9998',
                        'cursor': 'pointer'
                    },
                    lightBoxBodyStyle = {
                        'display': 'none',
                        'padding': '20px',
                        'width': '938px',
                        'border-radius': '4px',
                        'background-color': '#ffffff',
                        'z-index': '9999',
                        'position': 'relative',
                        'text-align': 'center',
                        'margin': '0 auto'
                    },
                    closeBtnStyle = {
                        'position': 'absolute',
                        'left': '942px',
                        'top': '-25px',
                        'width': '30px',
                        'line-height': '30px',
                        'background-color': '#ffffff',
                        'border-radius': '50%',
                        'cursor': 'pointer'
                    },
                    lightBoxBody = document.createElement('div'),
                    lightBoxBodyHTML =
                            '<div class=\"df-widget-close\" id=\"df-widget-close-cross\">&#10005;</div>' +
                            '<iframe src=\"' + settings.companyWidgetUrl +'\" width=\"900\" frameborder=\"0\">' +
                                '<p>Your browser may not support iframes.</p>' +
                            '</iframe>';

                popupWrapper.id = newElemsIds.popupWrap;

                overlay.id = newElemsIds.overlay;
                overlay.className += " df-widget-close";

                lightBoxBody.id = newElemsIds.body;
                lightBoxBody.innerHTML = lightBoxBodyHTML;

                methods.__setCss(popupWrapper, popupWrapperStyle);
                methods.__setCss(overlay, overlayStyle);
                methods.__setCss(lightBoxBody, lightBoxBodyStyle);
                methods.__setCss(lightBoxBody.querySelector('#df-widget-close-cross'), closeBtnStyle);

                popupWrapper.appendChild(overlay);
                popupWrapper.appendChild(lightBoxBody);
                body.appendChild(popupWrapper);
            },

            __hideWidget: function() {
                settings.popupWrap.style.display = 'none';
                settings.overlayElem.style.display = 'none';
                settings.bodyElem.style.display = 'none';
                document.body.style.overflow = 'auto';
            },

            __showWidget: function() {
                settings.popupWrap.style.display = 'block';
                settings.overlayElem.style.display = 'block';
                settings.bodyElem.style.display = 'block';
                document.body.style.overflow = 'hidden';
                methods.__centerPopup();
            },

            __centerPopup: function() {
                var overlay = document.getElementById(newElemsIds.overlay),
                    body = document.getElementById(newElemsIds.body);
                body.querySelector('iframe').style.height = overlay.clientHeight * 0.85 + 'px';
                //console.log((overlay.clientHeight - body.clientHeight) / 2);
                body.style.top = (overlay.clientHeight - body.clientHeight) / 2 + 'px';
            },

            bindUIActions: function() {

                window.onresize = function() {
                    methods.__centerPopup();
                };

                document.addEventListener('keydown', function(e) {
                    if( e.keyCode === 27 ) {
                        e.preventDefault();
                        methods.__hideWidget();
                    }
                }, false);

                document.getElementById(newElemsIds.buttonWrap).addEventListener('click', methods.__showWidget, false);

                for (var i = 0; i < settings.closeWidgetElems.length; i++) {
                    settings.closeWidgetElems[i].addEventListener('click', methods.__hideWidget, false);
                }
            }
    };

    methods.init();
})();

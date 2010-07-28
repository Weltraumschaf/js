/*
 * LICENSE
 *
 * "THE BEER-WARE LICENSE" (Revision 42):
 * "Sven Strittmatter" <ich[at]weltraumschaf[dot]de> wrote this file.
 * As long as you retain this notice you can do whatever you want with
 * this stuff. If we meet some day, and you think this stuff is worth it,
 * you can buy me a beer in return.
 */

/**
 *
 */
(function($) {
    var settings, kapi;

    function getQualifiedMethod(service, method) {
        return service + '.' + method;
    }

    function generateSignature(parameters) {
        var parameterString = '',
            parameterNames  = [],
            sortedNames;

        if ($(parameters).size() > 0) {
            $.each(parameters, function(name) {
                parameterNames.push(name);
            });
            sortedNames = parameterNames.sort();
            $.each(sortedNames, function(index) {
                var name  = sortedNames[index];
                parameterString += name + '=' + parameters[name];
            });
        }

        return hex_md5(parameterString + settings.secret);
    }

    function generateUri(service, method, parameters) {
        var uri = settings.baseUri  + '?',
            qualifiedMethod = getQualifiedMethod(service, method);

        uri += 'api_key=' + settings.apiKey  + '&';
        uri += 'v='       + settings.version + '&';
        uri += 'method='  + qualifiedMethod  + '&';
        uri += 'sig='     + generateSignature(settings.apiKey,
                                              settings.version,
                                              settings.secret,
                                              $.extend({}, parameters, {
                                                  'api_key': settings.apiKey,
                                                   'v':      settings.version,
                                                   'method': qualifiedMethod
                                              }));

        if ($(parameters).size() > 0) {
            $.each(parameters, function(name, value) {
                uri += '&' + name  + '='  + value;
            });
        }

        return uri;
    }

    /**
     * Setup function.
     */
    kapi = function(origSettings) {
        settings = $.extend(true, {}, kapi.defaultSettings, origSettings);
    };

    /**
     * Default settings.
     */
    kapi.defaultSettings = {
        baseUri: 'http://api.kwick.de/service/2.0/',
        version: '2.0',
        apiKey:  null,
        secret:  null
    };

    kapi.isError = function(o) {
        return ('error_code' in o && 'error_msg' in o);
    };

    kapi.request = function(opt) {
        $.ajax({
            type:     opt.type || 'GET',
            url:      generateUri(opt.service, opt.method, opt.params),
            success: function(data) {
                var isError = kapi.isError(data);

                if (isError) {
                    data.toString = function() {
                        return 'Error: ' + data.error_msg + ' [' + data.error_code + ']';
                    };
                    data.isError = function() { return true; }
                } else {
                    data.isError = function() { return false; }
                }

                callback(data);
            }
        });
    };
    
    // Expose plugin
    $.kapi = kapi;
})(jQuery);
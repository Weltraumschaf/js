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
 * jQuey plugin to call the KWICK! Social Platform API.
 *
 * Since the API supports cross origin request sharing we can do all stuuf
 * direct in JavaScript without any proxy stuff.
 */
(function($, global) {
    var settings, kapi;

    /**
     * Utilizes firebug console if available.
     * Logging could be enabled by $.kapi() options.
     */
    function log(msg) {
        if (!settings.debug) {
            return;
        }

        if (global.console && global.console.log && $.isFunction(global.console.log)) {
            global.console.log(msg);
        }
    }

    /**
     * Utilizes firebug console if available.
     * Debugging could be enabled by $.kapi() options.
     */
    function debug() {
        if (!settings.debug) {
            return;
        }

        if (global.console && global.console.debug && $.isFunction(global.console.debug)) {
            global.console.debug.apply(null, arguments);
        }
    }

    /**
     * Generates the full qualified method name.
     *
     * @param  service String
     * @param  method  String
     * @return String
     */
    function getQualifiedMethod(service, method) {
        return service + '.' + method;
    }

    /**
     * Generates the md5 hashed signature of the passed parameters.
     *
     * @param parameters Object
     * @return String
     */
    function generateSignature(parameters) {
        var parameterString = '',
            parameterNames  = [],
            sortedNames;

        if ($(parameters).size() > 0) {
            $.each(parameters, function(name) {
                parameterNames.push(name);
            });
            log('Generating signature with: ' + parameterNames);
            sortedNames = parameterNames.sort();
            $.each(sortedNames, function(index) {
                var name  = sortedNames[index];
                parameterString += name + '=' + parameters[name];
            });
            log('Plain parameter string: ' + parameterString);
        }

        return hex_md5(parameterString + settings.secret);
    }

    /**
     * Generates the full reuqest URI for an API call.
     *
     * @param  service    String
     * @param  method     String
     * @param  parameters Object
     * @return String
     */
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
     * Setup function. Call it to set up the API client with some paramaters.
     *
     * Example:
     * <code>
     * $.kapi({
     *     baseUri: 'http://api.kwick.de/service/2.0/', // optional, URI to the API
     *     version: '2.0',                              // optional, version of the API
     *     apiKey:  null,                               // REQUIRED, your API key
     *     secret:  null,                               // REQUIRED, the API secret
     *     debug:   false                               // optional, debuggign in firebug
     * });
     * </code>
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
        secret:  null,
        debug:   false
    };

    /**
     * Determines if a given object is an API error response.
     */
    kapi.isError = function(o) {
        return ('error_code' in o && 'error_msg' in o);
    };

    /**
     * Performs an API request.
     * 
     * Example:
     * <code>
     * $.kapi.request({
     *     type:    'POST',          // optional, default is GET
     *     service: 'Application',   // api service name (REQUIRED)
     *     method:  'getAPIVersion', // api method name (REQUIRED)
     *     params:  {                // optional api method parameters
     *         name1: 'value1'
     *         name2: 'value2'
     *     },
     *     callback: function(data) { ... } // callback function (REQUIRED)
     *                                      // Is called with the response object as
     *                                      // argument.
     * });
     * </code>
     *
     * @param  opt Object
     * @return XMLHttpRequest
     */
    kapi.request = function(opt) {
        if (!opt.service) {
            $.error('No "service" property passed in the options!');
        }

        if (!opt.method) {
            $.error('No "method" property passed in the options!');
        }

        if (!opt.callback) {
            $.error('No "callback" function property passed in the options!');
        }

        if (!$.isFunction()) {
            $.error('The passed callback option is not a function!');
        }

        return $.ajax({
            type:     opt.type || 'GET',
            url:      generateUri(opt.service, opt.method, opt.params),
            success: function(data) {
                if (!$.isPlainObject(data)) {
                    $.error('No valid object returnd by Ajax response!');
                }

                if (kapi.isError(data)) {
                    data.toString = function() {
                        return 'Error: ' + data.error_msg + ' [' + data.error_code + ']';
                    };
                    data.isError = function() { return true; }
                } else {
                    data.isError = function() { return false; }
                }

                opt.callback(data);
            }
        });
    };
    
    // Expose plugin
    $.kapi = kapi;

})(jQuery, window);
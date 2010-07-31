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
    var settings, kapi, md5;

    // enclose a foreign md5 lib
    (function() {
        /*
         * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
         * Digest Algorithm, as defined in RFC 1321.
         * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
         * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
         * Distributed under the BSD License
         * See http://pajhome.org.uk/crypt/md5 for more info.
         */

        /*
         * Configurable variables. You may need to tweak these to be compatible with
         * the server-side, but the defaults work in most cases.
         */
        var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
        var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

        /*
         * These are the functions you'll usually want to call
         * They take string arguments and return either hex or base-64 encoded strings
         */
        function hex_md5(s) {
            return rstr2hex(rstr_md5(str2rstr_utf8(s)));
        }

        function b64_md5(s) {
            return rstr2b64(rstr_md5(str2rstr_utf8(s)));
        }

        function any_md5(s, e) {
            return rstr2any(rstr_md5(str2rstr_utf8(s)), e);
        }
        
        function hex_hmac_md5(k, d) {
            return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
        }

        function b64_hmac_md5(k, d) {
            return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
        }

        function any_hmac_md5(k, d, e) {
            return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e);
        }

        /**
         * Calculate the MD5 of a raw string
         */
        function rstr_md5(s) {
          return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
        }

        /**
         * Calculate the HMAC-MD5, of a key and some data (raw strings)
         */
        function rstr_hmac_md5(key, data) {
            var bkey = rstr2binl(key);
          
            if(bkey.length > 16) {
                bkey = binl_md5(bkey, key.length * 8);
            }

            var ipad = Array(16), opad = Array(16);

            for (var i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);

            return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
        }

        /**
         * Convert a raw string to a hex string
         */
        function rstr2hex(input) {
            try { hexcase } catch(e) { hexcase=0; }

            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef",
                output = "",
                x;

            for (var i = 0; i < input.length; i++) {
                x = input.charCodeAt(i);
                output += hex_tab.charAt((x >>> 4) & 0x0F)
                       +  hex_tab.charAt( x        & 0x0F);
            }

            return output;
        }

        /**
         * Convert a raw string to a base-64 string
         */
        function rstr2b64(input) {
            try { b64pad } catch(e) { b64pad=''; }

            var tab    = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
                output = "",
                len    = input.length;
          
            for (var i = 0; i < len; i += 3) {
                var triplet = (input.charCodeAt(i) << 16)
                            | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                            | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
            
                for (var j = 0; j < 4; j++) {
                    if (i * 8 + j * 6 > input.length * 8) {
                        output += b64pad;
                    } else {
                        output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
                    }
                }
            }

            return output;
        }

        /**
         * Convert a raw string to an arbitrary string encoding
         */
        function rstr2any(input, encoding) {
            var divisor = encoding.length,
                i, j, q, x, quotient;

            /* Convert to an array of 16-bit big-endian values, forming the dividend */
            var dividend = Array(Math.ceil(input.length / 2));
          
            for (i = 0; i < dividend.length; i++) {
                dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
            }

            /*
             * Repeatedly perform a long division. The binary array forms the dividend,
             * the length of the encoding is the divisor. Once computed, the quotient
             * forms the dividend for the next step. All remainders are stored for later
             * use.
             */
            var full_length = Math.ceil( input.length * 8 /
                                        (Math.log(encoding.length) / Math.log(2)));
            var remainders = Array(full_length);
          
            for (j = 0; j < full_length; j++) {
                quotient = Array();
                x = 0;
            
                for (i = 0; i < dividend.length; i++) {
                    x = (x << 16) + dividend[i];
                    q = Math.floor(x / divisor);
                    x -= q * divisor;
                
                    if (quotient.length > 0 || q > 0) {
                        quotient[quotient.length] = q;
                    }
                }

                remainders[j] = x;
                dividend = quotient;
            }

            /* Convert the remainders to the output string */
            var output = "";
            
            for(i = remainders.length - 1; i >= 0; i--) {
                output += encoding.charAt(remainders[i]);
            }

            return output;
        }

        /**
         * Encode a string as utf-8.
         * For efficiency, this assumes the input is valid utf-16.
         */
        function str2rstr_utf8(input) {
            var output = "",
                i = -1,
                x, y;

            while (++i < input.length) {
                /* Decode utf-16 surrogate pairs */
                x = input.charCodeAt(i);
                y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;

                if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                    i++;
                }

                /* Encode output as utf-8 */
                if (x <= 0x7F) {
                    output += String.fromCharCode(x);
                } else if (x <= 0x7FF) {
                    output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                                  0x80 | ( x         & 0x3F));
                } else if(x <= 0xFFFF) {
                    output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                                  0x80 | ((x >>> 6 ) & 0x3F),
                                                  0x80 | ( x         & 0x3F));
                } else if(x <= 0x1FFFFF) {
                    output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                                  0x80 | ((x >>> 12) & 0x3F),
                                                  0x80 | ((x >>> 6 ) & 0x3F),
                                                  0x80 | ( x         & 0x3F));
                }
            }

            return output;
        }

        /**
         * Encode a string as utf-16
         */
        function str2rstr_utf16le(input) {
            var output = "";

            for (var i = 0, l = input.length; i < l; i++) {
                output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                              (input.charCodeAt(i) >>> 8) & 0xFF);
            }

            return output;
        }

        function str2rstr_utf16be(input) {
            var output = "";
            
            for (var i = 0, l = input.length; i < l; i++) {
                output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                               input.charCodeAt(i)        & 0xFF);
            }

            return output;
        }

        /**
         * Convert a raw string to an array of little-endian words
         * Characters >255 have their high-byte silently ignored.
         */
        function rstr2binl(input) {
            var output = Array(input.length >> 2);

            for (var i = 0, l = output.length; i < l; i++) {
                output[i] = 0;
            }

            for (i = 0, l = input.length * 8; i < l; i += 8) {
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
            }
          
            return output;
        }

        /**
         * Convert an array of little-endian words to a string
         */
        function binl2rstr(input) {
            var output = "";
          
            for(var i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
            }

            return output;
        }

        /**
         * Calculate the MD5 of an array of little-endian words, and a bit length.
         */
        function binl_md5(x, len) {
            /* append padding */
            x[len >> 5] |= 0x80 << ((len) % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var a =  1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d =  271733878;

            for(var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;

                a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
                d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
                c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
                b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
                a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
                d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
                c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
                b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
                a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
                d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
                c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
                b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
                a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
                d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
                c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
                b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

                a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
                d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
                c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
                b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
                a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
                d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
                c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
                b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
                a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
                d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
                c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
                b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
                a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
                d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
                c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
                b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

                a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
                d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
                c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
                b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
                a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
                d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
                c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
                b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
                a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
                d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
                c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
                b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
                a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
                d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
                c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
                b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

                a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
                d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
                c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
                b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
                a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
                d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
                c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
                b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
                a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
                d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
                c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
                b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
                a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
                d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
                c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
                b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd);
            }

            return Array(a, b, c, d);
        }

        /*
         * These functions implement the four basic operations the algorithm uses.
         */
        function md5_cmn(q, a, b, x, s, t) {
            return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
        }

        function md5_ff(a, b, c, d, x, s, t) {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function md5_gg(a, b, c, d, x, s, t) {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function md5_hh(a, b, c, d, x, s, t) {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t);
        }

        function md5_ii(a, b, c, d, x, s, t) {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        /**
         * Add integers, wrapping at 2^32. This uses 16-bit operations internally
         * to work around bugs in some JS interpreters.
         */
        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                msw = (x >> 16) + (y >> 16) + (lsw >> 16);

            return (msw << 16) | (lsw & 0xFFFF);
        }

        /**
         * Bitwise rotate a 32-bit number to the left.
         */
        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        // expose function
        md5 = hex_md5;
    })();
        
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
     * @param secret     String
     * @param hash       Bool   Default is true.
     * @return String
     */
    function generateSignature(parameters, secret, hash) {
        var parameterString = '',
            parameterNames  = [];

        hash = (typeof(hash) === 'undefined') ?true : hash;
        
        if (!$.isEmptyObject(parameters)) {
            for (name in parameters) {
                parameterNames.push(name);
            }
            
            parameterNames = parameterNames.sort();
            i = parameterNames.length;

            for (var i = 0, length = parameterNames.length, name; i < length; i++) {
                name = parameterNames[i];
                parameterString += name + '=' + parameters[name];
            }
        }

        if (hash) {
            return md5(parameterString + secret);
        } else {
            return parameterString + secret;
        }
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
        uri += 'sig='     + generateSignature($.extend({}, parameters, {
                                                  'api_key': settings.apiKey,
                                                   'v':      settings.version,
                                                   'method': qualifiedMethod
                                              }),
                                              settings.secret);

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
        secret:  null
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
        if (!settings) {
            $.error('The plugin isn not initialized. Please call $.kapi() first!');
        }

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

    kapi.t = function() {
        if (!window.assert) {
            throw 'Pleas include assert.js for run tests!';
        }

        // testing md5()
        assert(md5('abc') === '900150983cd24fb0d6963f7d28e17f72',
               'md5 of "abc" is 900150983cd24fb0d6963f7d28e17f72');
        assert(md5('Weltraumschaf') === 'c7915f7f245b1ca1bf5bc67caf936309',
               'md5 of "Weltraumschaf" is c7915f7f245b1ca1bf5bc67caf936309');

        // testing getQualifiedMethod()
        assert(getQualifiedMethod('foo', 'bar') === 'foo.bar',
               'foo, bar becomes foo.bar');
        assert(getQualifiedMethod('User', 'getVCard') === 'User.getVCard',
               'User, getVCard becomes fUseroo.getVCard');

        // testing generateSignature(parameters, secret, hash) withot md5
        assert(generateSignature({}, 'secret', false) === 'secret',
               generateSignature({}, 'secret', false) + ' === secret');
        assert(generateSignature({a: 1, c: 3, b:2}, 'secret', false) === 'a=1b=2c=3secret',
               generateSignature({a: 1, c: 3, b:2}, 'secret', false) + ' === a=1b=2c=3secret');
        assert(generateSignature({firstArg: 'bla', second_arg: 'blub'}, 'secret', false)
                                 === 'firstArg=blasecond_arg=blubsecret',
               generateSignature({firstArg: 'bla', second_arg: 'blub'}, 'secret', false) +
                                ' === firstArg=blasecond_arg=blubsecret');

        // testing generateUri()
        incomplete('generateUri()');

        // testing $.kapi()
        incomplete('$.kapi()');
        
        printSummary();
    };
    
    // Expose plugin
    $.kapi = kapi;

})(jQuery, window);
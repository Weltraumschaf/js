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
    
    var kapi = function(origSettings) {
        var settings = $.extend(true, {}, kapi.defaultSettings, origSettings);
    };

    /**
     * Default settings.
     */
    kapi.defaultSettings = {
        
    };

    // Expose plugin
    $.kapi = kapi;
})(jQuery);
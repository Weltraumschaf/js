
(function(global) {
    var summary = '', fails = '', assertions = '';

    function incomplete(message) {
            summary += 'I';
            fails   += 'Incomplete test: ' + message + '.\n';
        }

    function assert(that, message) {
        if (!that) {
            fails   += 'Failled that ' + message + '.\n';
            summary += 'F';
        } else {
            summary += '.';
        }

        assertions += 'Assert that ' + message + '.\n';
    }

    function printSummary(verbose) {
        global.document.write('<pre>');
        global.document.write(summary);

        if (fails) {
            global.document.write('\n\n' + fails);
        }

        if (verbose || false) {
            global.document.write('\n\n' + assertions);
        }

        global.document.write('</pre>');
    }

    global.incomplete   = incomplete;
    global.assert       = assert;
    global.printSummary = printSummary;
    
})(window);
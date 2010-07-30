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
 * Provides methods for calculating mean values in some ways.
 *
 * For more information about the math see http://en.wikipedia.org/wiki/Mean.
 *
 * @author Sven Strittmatte <ich[at]weltraumschaf[dot]de>
 * @version 1.0
 */
var MeanValue = {

    /**
     * Calculates the arithemtic mean value of given numbers.
     *
     * Example:
     * <code>
     * var average = MeanValue.arithmetic(1, 2, 3, 4, 5) // x = (1 + 2 + 3 + 4 + 5) / 5
     * </code>
     *
     * You can also pass an array of numbers:
     * <code>
     * MeanValue.arithmetic.apply(null, [1, 2, 3, 4, 5]);
     * </code>
     *
     * @return Number
     */
    arithmetic: function() {
        var sum = 0;

        for (var i = 0, j = arguments.length; i < j; i++) {
            sum += arguments[i];
        }

        return sum / arguments.length;
    },

    /**
     * Calculates the geometric mean value of given numbers.
     *
     * Example:
     * <code>
     * var average = MeanValue.geometric(1, 2, 3, 4, 5) // x = 5 √ (1 * 2 * 3 * 4 * 5)
     * </code>
     *
     * You can also pass an array of numbers:
     * <code>
     * MeanValue.geometric.apply(null, [1, 2, 3, 4, 5]);
     * </code>
     *
     * @return Number
     */
    geometric: function() {
        var sum = 1;

        for (var i = 0, j = arguments.length; i < j; i++) {
            sum *= arguments[i];
        }

        return Math.pow(sum, 1 / arguments.length);
    },

    /**
     * Calculates the harmonic mean value of given numbers.
     *
     * Example:
     * <code>
     * var average = MeanValue.harmonic(1, 2, 3, 4, 5) // x = 5 / (1/1 + 1/2 + 1/3 + 1/4 + 1/5)
     * </code>
     *
     * You can also pass an array of numbers:
     * <code>
     * MeanValue.harmonic.apply(null, [1, 2, 3, 4, 5]);
     * </code>
     *
     * @return Number
     */
    harmonic: function() {
        var sum = 0;

        for (var i = 0, j = arguments.length; i < j; i++) {
            sum += 1 / arguments[i];
        }

        return arguments.length / sum;
    },

    /**
     * Calculates the quadratic mean value of given numbers.
     *
     * Example:
     * <code>
     * var average = MeanValue.quadratic(1, 2, 3, 4, 5) // x = √(1^2 + 2^2 + 3^2 + 4^2 + 5^2) / 5
     * </code>
     *
     * You can also pass an array of numbers:
     * <code>
     * MeanValue.quadratic.apply(null, [1, 2, 3, 4, 5]);
     * </code>
     *
     * @return Number
     */
    quadratic: function() {
        var sum = 0;

        for (var i = 0, j = arguments.length; i < j; i++) {
            sum += Math.pow(arguments[i], 2);
        }

        return Math.sqrt(sum / arguments.length);
    },

    /**
     * Calculates the cubic mean value of given numbers.
     *
     * Example:
     * <code>
     * var average = MeanValue.cubic(1, 2, 3, 4, 5) // x = 3√(1^3 + 2^3 + 3^3 + 4^3 + 5^3) / 5
     * </code>
     *
     * You can also pass an array of numbers:
     * <code>
     * MeanValue.cubic.apply(null, [1, 2, 3, 4, 5]);
     * </code>
     *
     * @return Number
     */
    cubic: function() {
        var sum = 0;

        for (var i = 0, j = arguments.length; i < j; i++) {
            sum += Math.pow(arguments[i], 3);
        }

        return Math.pow(sum / arguments.length, 1 / 3);
    },

    /**
     * Rounds the passed number to the given amaount of decimal digits.
     *
     * Example:
     * <code>
     * MeanValue.round(3.1415);    // -> 3
     * MeanValue.round(3.1415, 1); // -> 3.1
     * MeanValue.round(3.1415, 2); // -> 3.14
     * MeanValue.round(3.1415, 3); // -> 3.142
     * </code>
     *
     * @param  number    Number The number to round.
     * @param  precision Number Amount of digits after decimal point.
     * @return Number
     */
    round: function(number, precision) {
        return parseFloat(number.toFixed(precision));
    },

    /**
     * Call this function to perform the unittests.
	 *
	 * This function requires a browsers document object.
     */
    t: function() {
			/**
			 * Collects the summary string.
			 *
			 * A period for passed, a F for failed and I for incomplete tests.
			 *
			 * @var String
			 */
        var summary = '', 
			/**
			 * Collects the assert messages on test fail.
			 * 
			 * @var String
			 */
			fails = '',
			/**
			 * The allowed maximum delta for floating equation.
			 * 
			 * @var Number
			 */
			delta = 0.000000001;

		/**
		 * Signals the presence of an incomplete test.
		 */
        function incomplete(message) {
            summary += 'I';
            fails   += 'Incomplete test: ' + message + '\n';
        }

		/**
		 * Assert that is true.
		 *
		 * @param that Bool
		 * @param message String
		 */
        function assert(that, message) {
            if (!that) {
                fails   += 'Failled ' + message + '\n';
                summary += 'F';
            } else {
                summary += '.';
            }
        }

		/**
		 * Prints the test summary after all tests.
		 */
        function printSummary() {
			if (!document) {
				throw 'Does not have browser document object!';
			}
			
            document.write('<pre>');
            document.write(summary);

            if (fails) {
                document.write('\n\n' + fails);
            }

            document.write('</pre>');
        }

        // testing MeanValue.arithmetic()
        assert(MeanValue.arithmetic(1, 2, 3, 4, 5) === 3,
               'arithmetic mean of 1, 2, 3, 4, 5 is 3');
        assert(MeanValue.arithmetic.apply(null, [1, 2, 3, 4, 5]) === 3,
               'arithmetic mean of 1, 2, 3, 4, 5 is 3');
        assert(MeanValue.arithmetic(7, 7, 7, 7) === 7,
               'arithmetic mean of 7, 7, 7, 7 is 7');

        // testing MeanValue.geometric()
        assert(Math.abs(MeanValue.geometric(1, 2, 3, 4, 5) - 2.605171085) < delta,
               'geometric mean of 1, 2, 3, 4, 5 is 2.605171085');
        assert(Math.abs(MeanValue.geometric.apply(null, [1, 2, 3, 4, 5])  - 2.605171085) < delta,
               'geometric mean of 1, 2, 3, 4, 5 is 2.605171085');
        assert(MeanValue.geometric(7, 7, 7, 7) === 7,
               'geometric mean of 7, 7, 7, 7 is 7');

        // testing MeanValue.harmonic()
        assert(Math.abs(MeanValue.harmonic(1, 2, 3, 4, 5) - 2.189781022) < delta,
               'harmonic mean of 1, 2, 3, 4, 5 is 2.189781022');
        assert(Math.abs(MeanValue.harmonic.apply(null, [1, 2, 3, 4, 5]) - 2.189781022) < delta,
               'harmonic mean of 1, 2, 3, 4, 5 is 2.189781022');
        assert(MeanValue.harmonic(7, 7, 7, 7) === 7,
               'harmonic mean of 7, 7, 7, 7 is 7');

        // testing MeanValue.quadratic()
        assert(Math.abs(MeanValue.quadratic(1, 2, 3, 4, 5) - 3.31662479) < delta,
               'quadratic mean of 1, 2, 3, 4, 5 is 3.31662479');
        assert(Math.abs(MeanValue.quadratic.apply(null, [1, 2, 3, 4, 5]) - 3.31662479) < delta,
               'quadratic mean of 1, 2, 3, 4, 5 is 3.31662479');
        assert(MeanValue.quadratic(7, 7, 7, 7) === 7,
               'quadratic mean of 7, 7, 7, 7 is 7');

        // testing MeanValue.cubic()
        assert(Math.abs(MeanValue.cubic(1, 2, 3, 4, 5) - 3.556893304) < delta,
               'cubic mean of 1, 2, 3, 4, 5 is 3.556893304');
        assert(Math.abs(MeanValue.cubic.apply(null, [1, 2, 3, 4, 5]) - 3.556893304) < delta,
               'cubic mean of 1, 2, 3, 4, 5 is 3.556893304');
        assert(Math.abs(MeanValue.cubic(7, 7, 7, 7) - 7) < delta,
               'cubic mean of 7, 7, 7, 7 is 7');

        // testing MeanValue.round()
        assert(MeanValue.round(3.1415)    === 3,
               'rounding 3.1415 to 3');
        assert(MeanValue.round(3.1415, 1) === 3.1,
               'rounding 3.1415 to 3.1');
        assert(MeanValue.round(3.1415, 2) === 3.14,
               'rounding 3.1415 to 3.14');
        assert(MeanValue.round(3.1415, 3) === 3.142,
               'Assert rounding 3.1415 to 3.142.');

        printSummary();
    }
};
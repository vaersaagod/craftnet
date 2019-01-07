import get from 'lodash/get'
import update from 'lodash/update'

export default {
    methods: {
        /**
         * Clones an object without references or bindings.
         * Optionally accepts a filtered property list with dot-syntax
         * for nested properties.
         *
         * Example:
         * ```
         * let obj = {
         *     test: 'value',
         *     foo: {
         *         bar: {
         *             baz: 'one',
         *             boo: 'two'
         *         }
         *     }
         * }
         *
         * // an existing value and a missing value, with default
         * let clone = simpleClone(obj, [
         *     'foo.bar.baz',
         *     ['aList', []]
         * ])
         *
         * clone == {foo: {bar: {baz: 'hello'}}, aList: []} // true
         * ```
         *
         * @param {Object} obj
         * @param {Array} propertyList
         */
        simpleClone(obj, propertyList) {
            let clone = JSON.parse(JSON.stringify(obj))

            if (!propertyList) {
                return clone
            }

            let filteredClone = {}

            for (let i = 0; i < propertyList.length; i++) {
                const path = propertyList[i];

                if (typeof path === 'object') {
                    update(filteredClone, path, () => get(clone, path[0], path[1]))
                } else {
                    update(filteredClone, path, () => get(clone, path, null))
                }
            }

            return filteredClone;
        }
    }
}

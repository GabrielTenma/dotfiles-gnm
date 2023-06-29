/**
 * Utility class to find out type of a value/object in Javascript
 */
class TypeUtilsClass {

    static isBoolean(value) {
        return typeof value === "boolean";
    }

    static isNumber(value) {
        return typeof value === "number";
    }

    static isString(value) {
        return typeof value === "string";
    }

    static isUndefined(value) {
        return typeof value === "undefined";
    }

    static isNull(value) {
        return !value && typeof value === "object";
    }

    static isSymbol(value) {
        return typeof value === "symbol";
    }
    
    static isFunction(value) {
        return typeof value === "function";
    }

    static isPermitive(value) {
        return (
            this.isBoolean(value)
            || this.isNumber(value)
            || this.isString(value)
            || this.isUndefined(value)
            || this.isNull(value)
            || this.isSymbol(value)
        );
    }

    /**
     * Return the typename of given value
     * @param {any} value 
     * @returns typeName of value
     */
    static typeOf(value) {
        if (this.isPermitive(value)) {
            return typeof value;
        }
        return Object.prototype.toString.call(value).slice(8, -1);
    }

    /**
     * Checks if type of given value is same as typeName passed in.
     * @param {any} value 
     * @param {string} typeName 
     * @returns - boolean - true if type matches with typeName otherwise false.
     */
    static isTypeOf(value, typeName) {
        return this.typeOf(value) === typeName;
    }
    
    static isArray(value) {
        return this.isTypeOf(value, "Array");
    }

    static isObject(value) {
        return this.isTypeOf(value, "Object");
    }
};

var TypeUtils = TypeUtilsClass;
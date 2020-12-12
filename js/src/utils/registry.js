/**
 * @file Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { defaults } from '../utils';
function toLowerCaseString(value) {
    return defaults(value, '').toString().toLowerCase();
}
export default class Registry {
    constructor(name) {
        this.name = name;
        this._dict = {};
    }
    add(key, value) {
        this._dict[toLowerCaseString(key)] = value;
    }
    get(key) {
        return this._dict[toLowerCaseString(key)];
    }
    get names() {
        return Object.keys(this._dict);
    }
}
//# sourceMappingURL=registry.js.map
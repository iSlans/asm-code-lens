"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalStorage = void 0;
class GlobalStorage {
    /**
     * Store the context here at activation of the extension.
     */
    static Init(context) {
        this.context = context;
    }
    /**
     * Get a value.
     */
    static Get(key) {
        return this.context.globalState.get(key);
    }
    /**
     * Store a value.
     */
    static Set(key, value) {
        this.context.globalState.update(key, value);
    }
}
exports.GlobalStorage = GlobalStorage;
//# sourceMappingURL=globalstorage.js.map
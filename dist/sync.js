"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goSync = goSync;
const utils_1 = require("./utils");
function goSync(fn) {
    try {
        return [fn(), null];
    }
    catch (e) {
        return [null, (0, utils_1.normalizeError)(e)];
    }
}

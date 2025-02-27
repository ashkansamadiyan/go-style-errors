"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goAsync = goAsync;
const utils_1 = require("./utils");
async function goAsync(promise) {
    try {
        return [await promise, null];
    }
    catch (e) {
        return [null, (0, utils_1.normalizeError)(e)];
    }
}

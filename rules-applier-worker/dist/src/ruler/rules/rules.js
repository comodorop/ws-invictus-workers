"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rules = void 0;
class Rules {
    constructor() {
    }
    static isOutOfPeriod(movementDate, createdAt) {
        console.log('isOutOfPeriod', movementDate, createdAt);
        console.log('isOutOfPeriod', typeof createdAt);
        if (!movementDate || !createdAt)
            return false;
        if (typeof createdAt === 'string') {
            createdAt = new Date(createdAt);
        }
        const date = new Date(movementDate);
        console.log('isOutOfPeriod', date);
        console.log('isOutOfPeriod', createdAt);
        console.log('isOutOfPeriod', date.getMonth(), createdAt.getMonth());
        return date.getMonth() !== createdAt.getMonth();
    }
}
exports.Rules = Rules;
//# sourceMappingURL=rules.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    const exists = await knex('tenants').where({ id: 'free' }).first();
    if (!exists) {
        await knex('tenants').insert({
            id: 'free',
            name: 'Free Tier',
            subdomain: 'free',
            schema: 't_free',
            plan: 'free',
        });
    }
}
async function down(knex) {
    await knex('tenants').where({ id: 'free' }).delete();
}
//# sourceMappingURL=20260101000004_seed_free_tenant.js.map
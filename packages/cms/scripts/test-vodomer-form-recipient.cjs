const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const schema = require('../src/api/vodomer-form/content-types/vodomer-form/schema.json');
const coreEntry = require.resolve('@strapi/core');
const validator = require(path.join(path.dirname(coreEntry), 'services/entity-validator/index.js'));
const model = { ...schema, uid: 'api::vodomer-form.vodomer-form' };
global.strapi = { getModel: () => model };

test('recipient is optional and Strapi validates its email on publication', async () => {
  const validate = (recipientEmail) => validator.validateEntityUpdate(model, { recipientEmail }, { isDraft: false });
  assert.equal((await validate('leads@example.com')).recipientEmail, 'leads@example.com');
  assert.equal((await validate(null)).recipientEmail, null);
  await assert.rejects(validate('not-an-email'), /email/i);
});

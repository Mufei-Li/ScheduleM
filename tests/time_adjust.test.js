const assert = require('assert');
const utils = require('../time_utils.js');

const baseSlots = [
  { start: '08:20', end: '09:05' },
  { start: '09:15', end: '10:00' },
  { start: '10:20', end: '11:05' },
  { start: '11:15', end: '12:00' },
  { start: '14:30', end: '15:15' },
  { start: '15:25', end: '16:10' },
  { start: '16:30', end: '17:15' },
  { start: '17:15', end: '18:00' },
  { start: '19:10', end: '19:55' },
  { start: '19:55', end: '20:40' }
];

let res = utils.computeShiftedSlots(baseSlots, 0, 'start', '08:30', { firstDuration: 45, maxIndex: 3 });
assert.ok(res.ok);
assert.strictEqual(res.slots[0].end, '09:15');
assert.strictEqual(res.slots[1].start, '09:25');
assert.strictEqual(res.slots[4].start, '14:30');

res = utils.computeShiftedSlots(baseSlots, 4, 'start', '14:40', { firstDuration: 45, maxIndex: 7 });
assert.ok(res.ok);
assert.strictEqual(res.slots[4].end, '15:25');
assert.strictEqual(res.slots[5].start, '15:35');
assert.strictEqual(res.slots[8].start, '19:10');

res = utils.computeShiftedSlots(baseSlots, 8, 'start', '19:20', { firstDuration: 45, maxIndex: 9 });
assert.ok(res.ok);
assert.strictEqual(res.slots[8].end, '20:05');
assert.strictEqual(res.slots[9].start, '20:05');

res = utils.computeShiftedSlots(baseSlots, 2, 'end', '10:00', { firstDuration: 45 });
assert.ok(!res.ok);

assert.ok(!utils.isValidTime('2'));
assert.ok(!utils.isValidTime('20:'));
assert.ok(!utils.isValidTime('20:0'));
assert.ok(utils.isValidTime('20:05'));

const valid = utils.validateSlots(baseSlots);
assert.ok(valid.ok);

const overlapSlots = baseSlots.map(s => ({ ...s }));
overlapSlots[0] = { start: '08:20', end: '09:30' };
overlapSlots[1] = { start: '09:00', end: '09:40' };
const invalid = utils.validateSlots(overlapSlots);
assert.ok(!invalid.ok);

console.log('time_adjust tests passed');
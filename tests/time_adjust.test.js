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

assert.strictEqual(utils.sanitizePeriodRange('1-2节'), '1-2');
assert.strictEqual(utils.sanitizePeriodRange('3-4节'), '3-4');
assert.strictEqual(utils.sanitizePeriodRange('第1节'), '1');
assert.strictEqual(utils.sanitizePeriodRange('0-2节'), '1-2');
assert.strictEqual(utils.sanitizePeriodRange('0-4节'), '1-4');

assert.deepStrictEqual(utils.parseWeekString('(1-2节)2-6周,8-12周(双)'), [2, 3, 4, 5, 6, 8, 10, 12]);
assert.deepStrictEqual(utils.parseWeekString('8-12周(XX)'), [8, 10, 12]);
assert.deepStrictEqual(utils.parseWeekString('1-16周(旦)'), [1, 3, 5, 7, 9, 11, 13, 15]);
assert.deepStrictEqual(utils.parseWeekString('2-16周(对)'), [2, 4, 6, 8, 10, 12, 14, 16]);

assert.strictEqual(utils.formatWeekRanges([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]), '第1-16周');
assert.strictEqual(utils.formatWeekRanges([1, 3, 4, 5, 7]), '第1,3-5,7周');

const tip = utils.formatClassAndWeeksLines(['(计科1班)', '计科2班', '', null], [1, 2, 3]);
assert.deepStrictEqual(tip.lines, ['计科1班/计科2班', '第1-3周']);

assert.strictEqual(utils.icsEscapeText('a,b;c\\d\ne'), 'a\\,b\\;c\\\\d\\ne');

assert.deepStrictEqual(utils.getPeriodBounds('1-2节'), { start: 1, end: 2 });
assert.deepStrictEqual(utils.getPeriodBounds('第3节'), { start: 3, end: 3 });
assert.deepStrictEqual(utils.getPeriodBounds('', 2), { start: 2, end: 2 });

const tr12 = utils.getTimeRangeForPeriod(baseSlots, '1-2', 1);
assert.deepStrictEqual(tr12, { startPeriod: 1, endPeriod: 2, startTime: '08:20', endTime: '10:00' });

const tr1 = utils.getTimeRangeForPeriod(baseSlots, '1', 1);
assert.deepStrictEqual(tr1, { startPeriod: 1, endPeriod: 1, startTime: '08:20', endTime: '09:05' });

const trFallback = utils.getTimeRangeForPeriod(baseSlots, '', 2);
assert.deepStrictEqual(trFallback, { startPeriod: 2, endPeriod: 2, startTime: '09:15', endTime: '10:00' });

const trInvalid = utils.getTimeRangeForPeriod(baseSlots, 'abc', null);
assert.strictEqual(trInvalid, null);

const long = 'DESCRIPTION:' + 'A'.repeat(80);
const folded = utils.icsFoldLine(long, 75);
assert.ok(folded.includes('\r\n '));
assert.strictEqual(folded.replace(/\r\n /g, ''), long);
folded.split(/\r\n /).forEach(part => {
  assert.ok(Buffer.byteLength(part, 'utf8') <= 75);
});

console.log('time_adjust tests passed');
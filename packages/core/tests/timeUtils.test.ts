import * as utils from '../src/time/timeUtils';
import { TimeSlot } from '../src/types';

const baseSlots: TimeSlot[] = [
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

describe('timeUtils', () => {
    test('computeShiftedSlots - morning start adjust', () => {
        const res = utils.computeShiftedSlots(baseSlots, 0, 'start', '08:30', { firstDuration: 45, maxIndex: 3 });
        expect(res.ok).toBe(true);
        expect(res.slots![0].end).toBe('09:15');
        expect(res.slots![1].start).toBe('09:25');
        expect(res.slots![4].start).toBe('14:30'); // Should not affect afternoon
    });

    test('computeShiftedSlots - afternoon start adjust', () => {
        const res = utils.computeShiftedSlots(baseSlots, 4, 'start', '14:40', { firstDuration: 45, maxIndex: 7 });
        expect(res.ok).toBe(true);
        expect(res.slots![4].end).toBe('15:25');
        expect(res.slots![5].start).toBe('15:35');
        expect(res.slots![8].start).toBe('19:10'); // Should not affect evening
    });

    test('computeShiftedSlots - evening start adjust', () => {
        const res = utils.computeShiftedSlots(baseSlots, 8, 'start', '19:20', { firstDuration: 45, maxIndex: 9 });
        expect(res.ok).toBe(true);
        expect(res.slots![8].end).toBe('20:05');
        expect(res.slots![9].start).toBe('20:05');
    });

    test('computeShiftedSlots - invalid end adjust (less than start)', () => {
        const res = utils.computeShiftedSlots(baseSlots, 2, 'end', '10:00', { firstDuration: 45 });
        expect(res.ok).toBe(false);
    });

    test('isValidTime', () => {
        expect(utils.isValidTime('2')).toBe(false);
        expect(utils.isValidTime('20:')).toBe(false);
        expect(utils.isValidTime('20:0')).toBe(false);
        expect(utils.isValidTime('20:05')).toBe(true);
    });

    test('validateSlots', () => {
        const valid = utils.validateSlots(baseSlots);
        expect(valid.ok).toBe(true);

        const overlapSlots = baseSlots.map(s => ({ ...s }));
        overlapSlots[0] = { start: '08:20', end: '09:30' };
        overlapSlots[1] = { start: '09:00', end: '09:40' };
        const invalid = utils.validateSlots(overlapSlots);
        expect(invalid.ok).toBe(false);
    });

    test('sanitizePeriodRange', () => {
        expect(utils.sanitizePeriodRange('1-2节')).toBe('1-2');
        expect(utils.sanitizePeriodRange('3-4节')).toBe('3-4');
        expect(utils.sanitizePeriodRange('第1节')).toBe('1');
        expect(utils.sanitizePeriodRange('0-2节')).toBe('1-2');
        expect(utils.sanitizePeriodRange('0-4节')).toBe('1-4');
    });

    test('parseWeekString', () => {
        expect(utils.parseWeekString('(1-2节)2-6周,8-12周(双)')).toEqual([2, 3, 4, 5, 6, 8, 10, 12]);
        expect(utils.parseWeekString('8-12周(XX)')).toEqual([8, 10, 12]);
        expect(utils.parseWeekString('1-16周(旦)')).toEqual([1, 3, 5, 7, 9, 11, 13, 15]);
        expect(utils.parseWeekString('2-16周(对)')).toEqual([2, 4, 6, 8, 10, 12, 14, 16]);
    });

    test('formatWeekRanges', () => {
        expect(utils.formatWeekRanges([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])).toBe('第1-16周');
        expect(utils.formatWeekRanges([1, 3, 4, 5, 7])).toBe('第1,3-5,7周');
    });

    test('formatClassAndWeeksLines', () => {
        const tip = utils.formatClassAndWeeksLines(['(计科1班)', '计科2班', '', null], [1, 2, 3]);
        expect(tip.lines).toEqual(['计科1班/计科2班', '第1-3周']);
    });

    test('icsEscapeText', () => {
        expect(utils.icsEscapeText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
    });

    test('getPeriodBounds', () => {
        expect(utils.getPeriodBounds('1-2节', 20)).toEqual({ start: 1, end: 2 });
        expect(utils.getPeriodBounds('第3节', 20)).toEqual({ start: 3, end: 3 });
        expect(utils.getPeriodBounds('', 2)).toEqual({ start: 2, end: 2 });
    });

    test('getTimeRangeForPeriod', () => {
        const tr12 = utils.getTimeRangeForPeriod(baseSlots, '1-2', 1);
        expect(tr12).toEqual({ startPeriod: 1, endPeriod: 2, startTime: '08:20', endTime: '10:00' });

        const tr1 = utils.getTimeRangeForPeriod(baseSlots, '1', 1);
        expect(tr1).toEqual({ startPeriod: 1, endPeriod: 1, startTime: '08:20', endTime: '09:05' });

        const trFallback = utils.getTimeRangeForPeriod(baseSlots, '', 2);
        expect(trFallback).toEqual({ startPeriod: 2, endPeriod: 2, startTime: '09:15', endTime: '10:00' });

        const trInvalid = utils.getTimeRangeForPeriod(baseSlots, 'abc', null);
        expect(trInvalid).toBeNull();
    });

    test('icsFoldLine', () => {
        const long = 'DESCRIPTION:' + 'A'.repeat(80);
        const folded = utils.icsFoldLine(long, 75);
        expect(folded).toContain('\r\n ');
        expect(folded.replace(/\r\n /g, '')).toBe(long);
        folded.split(/\r\n /).forEach(part => {
            expect(Buffer.byteLength(part, 'utf8')).toBeLessThanOrEqual(75);
        });
    });
});

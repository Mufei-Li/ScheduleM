// Adapter to expose Core modules to browser window object
// This allows script.js to access Core functionality without rewriting the whole app yet

import * as TimeUtils from '../../packages/core/src/time/timeUtils';
import * as NormalizeRule from '../../packages/core/src/rules/normalizeRule';
import * as ValidateRules from '../../packages/core/src/rules/validateRules';
import * as GenerateEvents from '../../packages/core/src/events/generateEvents';
import * as GroupEvents from '../../packages/core/src/events/groupEventsForDisplay';
import * as StandardizeLocation from '../../packages/core/src/rules/standardizeLocation';

// @ts-ignore
window.ScheduleLLMCore = {
    TimeUtils,
    NormalizeRule,
    ValidateRules,
    GenerateEvents,
    GroupEvents,
    StandardizeLocation
};

// Also map TimeUtils to legacy global for backward compatibility with some script.js calls
// @ts-ignore
window.ScheduleLLMTimeUtils = {
    ...TimeUtils,
    // Add legacy aliases if any were missed or named differently
};

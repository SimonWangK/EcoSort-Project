jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskDefined: jest.fn(() => false),
  isTaskRegisteredAsync: jest.fn(async () => false),
}));

jest.mock('expo-background-task', () => ({
  BackgroundTaskResult: {
    Success: 1,
    Failed: 2,
  },
  BackgroundTaskStatus: {
    Restricted: 2,
    Available: 3,
  },
  getStatusAsync: jest.fn(async () => 3),
  registerTaskAsync: jest.fn(async () => undefined),
}));

import {
  COUNCIL_RULE_SYNC_TASK,
  registerCouncilRuleBackgroundTask,
} from '../../services/backgroundTaskService';

describe('backgroundTaskService', () => {
  test('returns a stable task name and registers through mocked Expo background APIs', async () => {
    const status = await registerCouncilRuleBackgroundTask();

    expect(status.taskName).toBe(COUNCIL_RULE_SYNC_TASK);
    expect(status.available).toBe(true);
    expect(status.registered).toBe(true);
  });
});
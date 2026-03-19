// Shared types matching json-reporter.ts output

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'timedOut';

export type TestAttachment = {
  name: string;
  path?: string;
  contentType: string;
};

export type TestRecord = {
  id: string;
  title: string;
  file: string;
  status: TestStatus;
  durationMs: number;
  errors: string[];
  attachments: TestAttachment[];
  retries: number;
  startTime: string;
};

export type RunSummary = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
};

export type RunReport = {
  runId: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'passed' | 'failed' | 'interrupted' | 'timedout';
  summary: RunSummary;
  tests: TestRecord[];
  config: {
    baseURL: string | undefined;
    workers: number;
    retries: number;
  };
};

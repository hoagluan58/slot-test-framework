import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

type TestRecord = {
  id: string;
  title: string;
  file: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  durationMs: number;
  errors: string[];
  attachments: { name: string; path?: string; contentType: string }[];
  retries: number;
  startTime: string;
};

type RunReport = {
  runId: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'passed' | 'failed' | 'interrupted' | 'timedout';
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  tests: TestRecord[];
  config: {
    baseURL: string | undefined;
    workers: number;
    retries: number;
  };
};

class JsonReporter implements Reporter {
  private runId: string;
  private startTime: Date;
  private tests: TestRecord[] = [];
  private outputDir: string;

  constructor() {
    this.runId = `run-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    this.startTime = new Date();
    this.outputDir = process.env.REPORT_DIR ?? './report-dashboard/data';
  }

  onBegin(_config: FullConfig, _suite: Suite) {
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.tests.push({
      id: test.id,
      title: test.titlePath().join(' › '),
      file: test.location.file,
      status: result.status as TestRecord['status'],
      durationMs: result.duration,
      errors: result.errors.map((e) => e.message ?? String(e)),
      attachments: result.attachments.map((a) => ({
        name: a.name,
        path: a.path,
        contentType: a.contentType,
      })),
      retries: result.retry,
      startTime: result.startTime.toISOString(),
    });
  }

  async onEnd(result: FullResult) {
    const endTime = new Date();
    const passed = this.tests.filter((t) => t.status === 'passed').length;
    const failed = this.tests.filter((t) => t.status === 'failed' || t.status === 'timedOut').length;
    const skipped = this.tests.filter((t) => t.status === 'skipped').length;

    const report: RunReport = {
      runId: this.runId,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMs: endTime.getTime() - this.startTime.getTime(),
      status: result.status,
      summary: { total: this.tests.length, passed, failed, skipped },
      tests: this.tests,
      config: {
        baseURL: process.env.GAME_BASE_URL,
        workers: 1,
        retries: 1,
      },
    };

    const outputPath = path.join(this.outputDir, `${this.runId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 JSON report written: ${outputPath}`);
  }
}

export default JsonReporter;

import { Page, WebSocket } from '@playwright/test';
import { safeValidateServerMessage, ServerMessage } from '../schemas/ws-messages';

export type WsFrame = {
  direction: 'sent' | 'received';
  payload: string;
  timestamp: number;
  parsed?: ServerMessage;
  validationError?: string;
};

export class WsInterceptor {
  readonly frames: WsFrame[] = [];
  readonly errors: { payload: string; error: string; timestamp: number }[] = [];
  private sockets: WebSocket[] = [];

  constructor(private page: Page) {}

  /** Start intercepting — call before navigating to the game URL */
  attach() {
    this.page.on('websocket', (ws) => {
      this.sockets.push(ws);

      ws.on('framesent', (frame) => {
        this.frames.push({
          direction: 'sent',
          payload: frame.payload as string,
          timestamp: Date.now(),
        });
      });

      ws.on('framereceived', (frame) => {
        const payload = frame.payload as string;
        let parsed: ServerMessage | undefined;
        let validationError: string | undefined;

        try {
          const raw = JSON.parse(payload);
          const result = safeValidateServerMessage(raw);
          if (result.success) {
            parsed = result.data;
          } else {
            validationError = result.error.message;
            this.errors.push({ payload, error: result.error.message, timestamp: Date.now() });
          }
        } catch (e) {
          validationError = `JSON parse error: ${String(e)}`;
          this.errors.push({ payload, error: validationError, timestamp: Date.now() });
        }

        this.frames.push({ direction: 'received', payload, timestamp: Date.now(), parsed, validationError });
      });
    });
  }

  /** Wait until a message of a specific type is received */
  async waitForMessageType(type: string, timeoutMs = 10000): Promise<WsFrame> {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolve, reject) => {
      const check = () => {
        const found = this.frames.find(
          (f) => f.direction === 'received' && f.parsed?.type === type
        );
        if (found) return resolve(found);
        if (Date.now() > deadline) return reject(new Error(`Timeout waiting for WS message type: ${type}`));
        setTimeout(check, 100);
      };
      check();
    });
  }

  /** All received messages of a given type */
  messagesOfType(type: string): WsFrame[] {
    return this.frames.filter((f) => f.direction === 'received' && f.parsed?.type === type);
  }

  /** Whether any schema validation errors occurred */
  hasValidationErrors(): boolean {
    return this.errors.length > 0;
  }

  /** Summary for the JSON reporter */
  getSummary() {
    return {
      totalFrames: this.frames.length,
      sent: this.frames.filter((f) => f.direction === 'sent').length,
      received: this.frames.filter((f) => f.direction === 'received').length,
      validationErrors: this.errors.length,
      errors: this.errors,
    };
  }
}

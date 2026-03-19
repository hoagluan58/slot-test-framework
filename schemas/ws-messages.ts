import { z } from 'zod';

// ─── Common ───────────────────────────────────────────────────────────────────

export const WsBaseSchema = z.object({
  type: z.string(),
  requestId: z.string().optional(),
  timestamp: z.number().optional(),
});

// ─── Spin Request (Client → Server) ──────────────────────────────────────────

export const SpinRequestSchema = WsBaseSchema.extend({
  type: z.literal('SPIN_REQUEST'),
  betAmount: z.number().positive(),
  currency: z.string().min(1),
  sessionId: z.string().min(1),
});

export type SpinRequest = z.infer<typeof SpinRequestSchema>;

// ─── Spin Response (Server → Client) ─────────────────────────────────────────

export const SymbolGridSchema = z.array(z.array(z.string()));

export const SpinResponseSchema = WsBaseSchema.extend({
  type: z.literal('SPIN_RESPONSE'),
  requestId: z.string(),
  result: z.object({
    symbols: SymbolGridSchema,
    winAmount: z.number().min(0),
    isWin: z.boolean(),
    isBonus: z.boolean(),
    isFreeSpin: z.boolean(),
    multiplier: z.number().min(1),
    newBalance: z.number().min(0),
  }),
  error: z.null().optional(),
});

export type SpinResponse = z.infer<typeof SpinResponseSchema>;

// ─── Balance Update (Server → Client) ────────────────────────────────────────

export const BalanceUpdateSchema = WsBaseSchema.extend({
  type: z.literal('BALANCE_UPDATE'),
  balance: z.number().min(0),
  currency: z.string().min(1),
});

export type BalanceUpdate = z.infer<typeof BalanceUpdateSchema>;

// ─── Error Message (Server → Client) ─────────────────────────────────────────

export const ServerErrorSchema = WsBaseSchema.extend({
  type: z.literal('SERVER_ERROR'),
  code: z.string(),
  message: z.string(),
});

export type ServerError = z.infer<typeof ServerErrorSchema>;

// ─── Session Init (Server → Client) ──────────────────────────────────────────

export const SessionInitSchema = WsBaseSchema.extend({
  type: z.literal('SESSION_INIT'),
  sessionId: z.string(),
  initialBalance: z.number().min(0),
  currency: z.string(),
  availableBets: z.array(z.number()),
});

export type SessionInit = z.infer<typeof SessionInitSchema>;

// ─── Union of all known server messages ───────────────────────────────────────

export const ServerMessageSchema = z.discriminatedUnion('type', [
  SpinResponseSchema,
  BalanceUpdateSchema,
  ServerErrorSchema,
  SessionInitSchema,
]);

export type ServerMessage = z.infer<typeof ServerMessageSchema>;

// ─── Validator helper ─────────────────────────────────────────────────────────

export function validateServerMessage(raw: unknown): ServerMessage {
  return ServerMessageSchema.parse(raw);
}

export function safeValidateServerMessage(raw: unknown) {
  return ServerMessageSchema.safeParse(raw);
}

import axios, { AxiosError, AxiosInstance } from 'axios';
import { type TransferRequest } from '@/types/transfer';

/**
 * Squad disbursement (payout) API client.
 * Docs: https://squadinc.gitbook.io/squad-api-documentation/transfer-api
 *
 * Endpoints used:
 *   POST /payout/account/lookup  — name enquiry (verify account exists before transfer)
 *   POST /payout/transfer        — initiate transfer
 *   POST /payout/requery         — check status of a previous transfer
 */

const SANDBOX_BASE = 'https://sandbox-api-d.squadco.com';
const PRODUCTION_BASE = 'https://api-d.squadco.com';

function getBaseUrl(): string {
  return process.env.SQUAD_ENV === 'production' ? PRODUCTION_BASE : SANDBOX_BASE;
}

let _client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  // Lazy init so missing env doesn't crash on import
  if (_client) return _client;
  const secret = process.env.SQUAD_SECRET_KEY;
  if (!secret) {
    throw new SquadError('SQUAD_SECRET_KEY is not configured', { status: 0 });
  }
  _client = axios.create({
    baseURL: getBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    timeout: 30_000,
  });
  return _client;
}

export class SquadError extends Error {
  status: number;
  squadCode?: string;
  responseBody?: unknown;

  constructor(
    message: string,
    args: { status: number; squadCode?: string; responseBody?: unknown }
  ) {
    super(message);
    this.name = 'SquadError';
    this.status = args.status;
    this.squadCode = args.squadCode;
    this.responseBody = args.responseBody;
  }
}

interface SquadResponse<T> {
  status: number;
  success?: boolean;
  message: string;
  data: T;
}

function unwrap<T>(body: SquadResponse<T>): T {
  // Squad returns either `success: true` or `status: 200`
  const ok = body.success === true || body.status === 200;
  if (!ok) {
    throw new SquadError(body.message || 'Squad API returned non-success', {
      status: body.status ?? 0,
      responseBody: body,
    });
  }
  return body.data;
}

function rethrow(err: unknown, ctx: string): never {
  if (err instanceof SquadError) throw err;
  const ax = err as AxiosError<SquadResponse<unknown>>;
  const status = ax.response?.status ?? 0;
  const data = ax.response?.data;
  const apiMessage = (data as { message?: string } | undefined)?.message;
  throw new SquadError(
    `Squad ${ctx} failed: ${apiMessage || ax.message || 'unknown error'}`,
    { status, responseBody: data }
  );
}

// =============================================================
// Account lookup (name enquiry)
// =============================================================
export interface LookupResponse {
  account_name: string;
  account_number: string;
  bank_code: string;
}

export async function lookupAccount(
  bank_code: string,
  account_number: string
): Promise<LookupResponse> {
  try {
    const res = await getClient().post<SquadResponse<LookupResponse>>(
      '/payout/account/lookup',
      { bank_code, account_number }
    );
    return unwrap(res.data);
  } catch (err) {
    return rethrow(err, 'account lookup');
  }
}

// =============================================================
// Initiate transfer
// =============================================================
export interface TransferData {
  nip_transaction_reference?: string;
  transaction_reference: string;
  amount: string;
  currency_id: string;
  account_name?: string;
  account_number?: string;
  bank_code?: string;
  remark?: string;
  email?: string;
  fee_charged?: string;
  merchant_amount?: string;
  transaction_status?: string;
}

/**
 * Generate an alphanumeric transaction reference Squad will accept.
 * Squad requires alphanumeric; we keep it short and unique.
 */
function generateTransactionReference(runId?: string): string {
  const base = (runId || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WOT${base}${ts}${rand}`;
}

export interface InitiateTransferResult {
  squad_reference: string;
  status: string;
  response_data: TransferData;
}

export async function initiateTransfer(
  req: TransferRequest
): Promise<InitiateTransferResult> {
  const transaction_reference = generateTransactionReference(req.run_id);

  // Squad requires amount as a STRING in Kobo (₦1 = 100 kobo)
  const amountKobo = Math.round(req.amount * 100).toString();

  const payload = {
    transaction_reference,
    amount: amountKobo,
    bank_code: req.beneficiary_bank,
    account_number: req.beneficiary_account,
    account_name: req.beneficiary_name,
    currency_id: 'NGN',
    remark: req.narration?.slice(0, 100) || 'Wotmind transfer',
  };

  try {
    const res = await getClient().post<SquadResponse<TransferData>>(
      '/payout/transfer',
      payload
    );
    const data = unwrap(res.data);
    return {
      squad_reference: data.transaction_reference,
      status: data.transaction_status || 'pending',
      response_data: data,
    };
  } catch (err) {
    return rethrow(err, 'transfer');
  }
}

// =============================================================
// Requery transfer status
// =============================================================
export async function requeryTransfer(
  transaction_reference: string
): Promise<{ status: string; amount: number; response_data: TransferData }> {
  try {
    const res = await getClient().post<SquadResponse<TransferData>>(
      '/payout/requery',
      { transaction_reference }
    );
    const data = unwrap(res.data);
    return {
      status: data.transaction_status || 'pending',
      amount: Number(data.amount || 0) / 100,
      response_data: data,
    };
  } catch (err) {
    return rethrow(err, 'requery');
  }
}

// Back-compat alias for the old verify name used in webhooks/UI
export const verifyTransaction = requeryTransfer;

// =============================================================
// Diagnostic ping — used by /api/diagnostics
// =============================================================
export async function pingSquad(): Promise<{ ok: boolean; message: string }> {
  const secret = process.env.SQUAD_SECRET_KEY;
  if (!secret) return { ok: false, message: 'SQUAD_SECRET_KEY not set' };

  // The lookup endpoint with a known dummy account will return an error
  // payload, but a 200 HTTP response confirms auth + base URL work.
  // We treat ANY non-401/403 response as "credentials reach Squad".
  try {
    await getClient().post('/payout/account/lookup', {
      bank_code: '058',
      account_number: '0000000000',
    });
    return { ok: true, message: 'Squad reachable, credentials accepted' };
  } catch (err) {
    const ax = err as AxiosError<{ message?: string }>;
    const status = ax.response?.status ?? 0;
    if (status === 401 || status === 403) {
      return { ok: false, message: `Auth rejected (HTTP ${status}). Check SQUAD_SECRET_KEY.` };
    }
    if (status >= 400 && status < 500) {
      // 400-class non-auth errors mean credentials worked but the dummy account failed validation — that's fine
      return { ok: true, message: 'Squad reachable, credentials accepted' };
    }
    return {
      ok: false,
      message: `Network error: ${ax.message || 'unknown'}${status ? ` (HTTP ${status})` : ''}`,
    };
  }
}

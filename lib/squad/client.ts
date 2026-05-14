import axios from 'axios';
import { type TransferRequest } from '@/types/transfer';

const baseURL = 'https://sandbox-api-d.squadco.com';

const squadClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.SQUAD_SECRET_KEY}`,
  },
});

export interface SquadInitiateResponse {
  success: boolean;
  message: string;
  data: {
    transaction_reference: string;
    transaction_id: string;
    amount: number;
    currency: string;
    status: string;
    timestamp: string;
  };
}

export interface SquadVerifyResponse {
  success: boolean;
  message: string;
  data: {
    transaction_reference: string;
    transaction_id: string;
    amount: number;
    currency: string;
    status: string;
    timestamp: string;
  };
}

export async function initiateTransfer(req: TransferRequest) {
  const transactionRef = `WOT-${req.run_id}-${Date.now()}`;
  const amountInKobo = req.amount * 100;

  const payload = {
    currency: req.currency,
    amount: amountInKobo,
    bank_code: req.beneficiary_bank,
    account_number: req.beneficiary_account,
    account_name: req.beneficiary_name,
    narration: req.narration,
    transaction_reference: transactionRef,
  };

  const response = await squadClient.post<SquadInitiateResponse>(
    '/payout/initiate',
    payload
  );

  return {
    squad_reference: response.data.data.transaction_reference,
    status: response.data.data.status,
    response_data: response.data.data,
  };
}

export async function verifyTransaction(reference: string) {
  const response = await squadClient.get<SquadVerifyResponse>(
    `/transaction/verify/${reference}`
  );

  return {
    status: response.data.data.status,
    amount: response.data.data.amount / 100,
    response_data: response.data.data,
  };
}

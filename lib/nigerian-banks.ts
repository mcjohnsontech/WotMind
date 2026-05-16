export interface NigerianBank {
  code: string;
  name: string;
}

/**
 * Common Nigerian banks — NIBSS codes used by Squad transfers.
 * Source: Squad bank-code list. Add more as needed.
 */
export const NIGERIAN_BANKS: NigerianBank[] = [
  { code: '044', name: 'Access Bank' },
  { code: '063', name: 'Access Bank (Diamond)' },
  { code: '035', name: 'ALAT by Wema' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '50211', name: 'Kuda Microfinance Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '50515', name: 'Moniepoint MFB' },
  { code: '50746', name: 'Opay' },
  { code: '50739', name: 'Palmpay' },
  { code: '999992', name: 'OPay (Paycom)' },
  { code: '120001', name: 'PayCom (Opay)' },
];

export function bankNameByCode(code: string): string | undefined {
  return NIGERIAN_BANKS.find((b) => b.code === code)?.name;
}

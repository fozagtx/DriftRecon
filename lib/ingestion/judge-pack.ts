export type JudgePack = {
  stripe: string;
  gumroad: string;
  bank: string;
  dodo: unknown;
  groundTruth: unknown;
};

export function isJudgePack(value: unknown): value is JudgePack {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.stripe === 'string' &&
    typeof record.gumroad === 'string' &&
    typeof record.bank === 'string' &&
    'dodo' in record &&
    'groundTruth' in record
  );
}

export function judgePackToUploads(pack: JudgePack) {
  return [
    { filename: 'stripe.csv', content: pack.stripe },
    { filename: 'gumroad.csv', content: pack.gumroad },
    { filename: 'bank.csv', content: pack.bank },
    { filename: 'dodo-events.json', content: JSON.stringify(pack.dodo) },
    { filename: 'ground-truth.json', content: JSON.stringify(pack.groundTruth) },
  ];
}

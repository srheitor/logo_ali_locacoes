import { createHash } from 'node:crypto';

/** UUID determinístico a partir do id de um registro dos mocks do front ("an-01", "usr-aluno"…). */
export function uuidDoMock(chave: string) {
  const h = createHash('sha1').update(`logoali:${chave}`).digest();
  h[6] = (h[6]! & 0x0f) | 0x50;
  h[8] = (h[8]! & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

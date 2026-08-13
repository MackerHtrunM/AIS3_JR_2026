'use strict';
const { rsa_decode } = require('./pollard_rho');


function toBigInt(value, label) {
  if (typeof value !== 'string' || !/^[0-9]+$/.test(value.trim())) {
    throw new Error(`「${label}」必須是十進位正整數`);
  }
  return BigInt(value.trim());
}


function powMod(base, exponent, modulus) {
  let result = 1n;
  let b = base % modulus;
  let e = exponent;

  while (e > 0n) {
    if (e & 1n) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e >>= 1n;
  }
  return result;
}

function toPlaintext(m) {
  if (m <= 0n) return null;

  let hex = m.toString(16);
  if (hex.length % 2 === 1) hex = '0' + hex;

  const buf = Buffer.from(hex, 'hex');
  const text = buf.toString('utf8');


  if (!Buffer.from(text, 'utf8').equals(buf)) return null;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text)) return null;

  return text;
}

function crack(nStr, eStr, cStr) {
  const n = toBigInt(nStr, '模數 N');
  const e = toBigInt(eStr, '公鑰 e');
  const c = toBigInt(cStr, '密文 c');

  if (n < 2n) throw new Error('「模數 N」必須大於 1');
  if (e < 1n) throw new Error('「公鑰 e」必須大於 0');

  const output = rsa_decode(n, e, c);

  // pollard_rho.js 用回傳字串來表示失敗
  if (typeof output === 'string') {
    throw new Error(output.startsWith('ERROR:') ? output.slice('ERROR:'.length) : output);
  }
  if (typeof output !== 'bigint') {
    throw new Error('分解失敗，沒有得到可用的結果');
  }

  if (powMod(output, e, n) !== c) {
    throw new Error('無法還原明文：e 與 φ(N) 可能不互質，或 N 不是兩個質數的乘積');
  }

  const plaintext = toPlaintext(output);

  return {
    m: output.toString(),
    plaintext: plaintext ?? '（無法解析為文字）',
  };
}

module.exports = { crack };

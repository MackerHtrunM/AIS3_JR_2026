'use strict';

// Cisco IOS Type 7 密碼加解密
// 演算法參考 Py-CiscoT7 (Ian Neill / Matt Raio)
// Key text: 'dsfd;kfoA,.iyewrkldJKDHSUBsgvca69834ncxv9873254k;fg87'
const KEY_HEX = [
  0x64, 0x73, 0x66, 0x64, 0x3B, 0x6B, 0x66, 0x6F, 0x41, 0x2C,
  0x2E, 0x69, 0x79, 0x65, 0x77, 0x72, 0x6B, 0x6C, 0x64, 0x4A,
  0x4B, 0x44, 0x48, 0x53, 0x55, 0x42, 0x73, 0x67, 0x76, 0x63,
  0x61, 0x36, 0x39, 0x38, 0x33, 0x34, 0x6E, 0x63, 0x78, 0x76,
  0x39, 0x38, 0x37, 0x33, 0x32, 0x35, 0x34, 0x6B, 0x3B, 0x66,
  0x67, 0x38, 0x37
];

function cisco7Decrypt(text) {
  const trimmed = String(text).trim();

  if (trimmed.length < 4 || trimmed.length > 52 || trimmed.length % 2 !== 0) {
    throw new Error('加密字串長度不正確，必須是 4 到 52 碼的偶數長度');
  }

  const saltPart = trimmed.slice(0, 2);
  if (!/^\d{2}$/.test(saltPart)) {
    throw new Error('前兩碼必須是十進位的偏移量');
  }

  const salt = parseInt(saltPart, 10);
  if (salt < 0 || salt > 15) {
    throw new Error('偏移量必須是 0 到 15 之間的整數');
  }

  const body = trimmed.slice(2);
  if (!/^[0-9A-Fa-f]+$/.test(body)) {
    throw new Error('加密內容包含非十六進位字元');
  }

  let decrypted = '';
  for (let i = 0; i < body.length; i += 2) {
    const encChar = parseInt(body.substr(i, 2), 16);
    const keyChar = KEY_HEX[(i / 2 + salt) % 53];
    decrypted += String.fromCharCode(encChar ^ keyChar);
  }

  return decrypted;
}

module.exports = { cisco7Decrypt };
'use strict';

const express = require('express');

const caesar = require('../services/caesar');
const vigenere = require('../services/vigenere');
const columnar = require('../services/columnar');
const base64 = require('../services/base64');
const detect = require('../services/detect');
const rsa = require('../services/rsa');
const cisco7 = require('../services/cisco7');

const router = express.Router();


const ok = (data) => ({ success: true, data, error: null });
const fail = (message) => ({ success: false, data: null, error: message });

function run(res, task) {
  try {
    return res.json(ok(task()));
  } catch (err) {
    console.warn('[api] 400:', err.message);
    return res.status(400).json(fail(err.message));
  }
}


/** 必填字串 */
function requireString(body, name) {
  const value = body[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`缺少參數 ${name}`);
  }
  return value;
}



// 確認是否存活
// GET /api/health
router.get('/health', (req, res) => {
  res.json(ok({ status: 'ok' }));
});





// 凱薩加密
router.post('/caesar/encrypt', (req, res) => run(res, () => {
  const body = req.body ?? {};
  return { result: caesar.caesarEncrypt(requireString(body, 'text'), body.shift) };
}));


router.post('/caesar/decrypt', (req, res) => run(res, () => {
  const body = req.body ?? {};
  return { result: caesar.caesarDecrypt(requireString(body, 'text'), body.shift) };
}));

router.post('/caesar/bruteforce', (req, res) => run(res, () => {
  const text = requireString(req.body ?? {}, 'text');

  //必要
  const results = caesar.caesarBruteForce(text).map((item) => ({
    shift: item.shift,
    result: item.result ?? item.text,
  }));

  return { results };
}));







// 維吉尼亞密碼
router.post('/vigenere/encrypt', (req, res) => run(res, () => {
  const body = req.body ?? {};
  return { result: vigenere.vigenereEncrypt(requireString(body, 'text'), requireString(body, 'key')) };
}));

router.post('/vigenere/decrypt', (req, res) => run(res, () => {
  const body = req.body ?? {};
  return { result: vigenere.vigenereDecrypt(requireString(body, 'text'), requireString(body, 'key')) };
}));






// 欄位轉換
router.post('/columnar/encrypt', (req, res) => run(res, () => {
  const body = req.body ?? {};
  return { result: columnar.columnarEncrypt(requireString(body, 'text'), requireString(body, 'key')) };
}));

router.post('/columnar/decrypt', (req, res) => run(res, () => {
  const body = req.body ?? {};
  return { result: columnar.columnarDecrypt(requireString(body, 'text'), requireString(body, 'key')) };
}));







// Base64（只確認參數有沒有來）
router.post('/base64/encode', (req, res) => run(res, () => {
  const text = requireString(req.body ?? {}, 'text');
  return { result: base64.encodeText(text) };
}));

// 參數名： b64_string
router.post('/base64/decode', (req, res) => run(res, () => {
  const b64String = requireString(req.body ?? {}, 'b64_string');
  return { result: base64.decodeText(b64String) };
}));





// RSA
router.post('/rsa/crack', (req, res) => run(res, () => {
  const body = req.body ?? {};
  return rsa.crack(
    requireString(body, 'n'),
    requireString(body, 'e'),
    requireString(body, 'c'),
  );
}));




// Cisco IOS Type 7
router.post('/cisco7/decrypt', (req, res) => run(res, () => {
  const text = requireString(req.body ?? {}, 'text');
  return { result: cisco7.cisco7Decrypt(text) };
}));




// 自動偵測
router.post('/detect', (req, res) => run(res, () => {
  const text = requireString(req.body ?? {}, 'text');
  return { candidates: detect.detect(text) };
}));

module.exports = router;
module.exports.ok = ok;
module.exports.fail = fail;

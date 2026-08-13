'use strict';

const base64 = require('./base64');

function isReadable(text) {
    const characters = Array.from(text);
    if (characters.length === 0) return false;

    const readable = characters.filter((char) =>
        char === '\n' || char === '\r' || char === '\t' || char.codePointAt(0) >= 32
    ).length;
    return readable / characters.length >= 0.9;
}

function looksLikeBase64(text) {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.length < 4 || cleaned.length % 4 === 1) return false;
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) return false;

    try {
        return isReadable(base64.decodeText(cleaned));
    } catch {
        return false;
    }
}

function detect(text) {
    if (typeof text !== 'string' || text.trim() === '') {
        throw new Error('輸入不得為空');
    }

    const trimmed = text.trim();
    if (/^[1-9][0-9]*$/.test(trimmed)) {
        return [{
            tool: 'rsa',
            label: 'RSA 整數密文',
            reason: '內容是十進位正整數，可能是 RSA 的 N、e 或 c'
        }];
    }

    if (looksLikeBase64(trimmed)) {
        return [{
            tool: 'base64',
            label: 'Base64',
            reason: '字元集、padding 與解碼後的 UTF-8 文字都符合 Base64 格式'
        }];
    }

    const letters = trimmed.match(/[A-Za-z]/g) ?? [];
    const visible = trimmed.match(/\S/g) ?? [];
    if (letters.length < 3 || letters.length / visible.length < 0.6) return [];

    const candidates = [{
        tool: 'caesar',
        label: '凱撒密碼',
        reason: '內容以英文字母為主，可嘗試 26 種位移'
    }, {
        tool: 'vigenere',
        label: '維吉尼亞密碼',
        reason: '英文字母比例高，可能是使用重複字母金鑰的替換密碼'
    }];

    if (!/\s/.test(trimmed)) {
        candidates.push({
            tool: 'columnar',
            label: '欄位轉換',
            reason: '密文沒有空白，符合欄位轉換會移除空白的特徵'
        });
    }
    return candidates;
}

module.exports = { detect, looksLikeBase64 };

// 維吉尼亞
function normalizeKey(key) {
    if (typeof key !== "string") {
        throw new Error("金鑰必須是字串");
    }
    const trimmed = key.trim();
    if (trimmed.length === 0) {
        throw new Error("金鑰不得為空");
    }
    if (!/^[A-Za-z]+$/.test(trimmed)) {
        throw new Error("金鑰只能包含英文字母");
    }
    return trimmed.toUpperCase();
}

function assertText(text) {
    if (typeof text !== "string") {
        throw new Error("輸入必須是字串");
    }
    if (text.length === 0) {
        throw new Error("輸入不得為空");
    }
}

function vigenereCipher(text, key, decrypt = false) {
    assertText(text);
    const normalizedKey = normalizeKey(key);

    let result = "";
    let keyIndex = 0;

    for (const char of text) {
        const code = char.charCodeAt(0);
        const isUpper = code >= 65 && code <= 90;
        const isLower = code >= 97 && code <= 122;

        if (!isUpper && !isLower) {
            result += char;
            continue;
        }

        const keyChar = normalizedKey[keyIndex % normalizedKey.length];
        let shift = keyChar.charCodeAt(0) - 65;
        if (decrypt) shift = -shift;

        const base = isUpper ? 65 : 97;
        // 先取模再加 26，避免 shift 為負時 JS 的 % 回傳負值
        const offset = (((code - base + shift) % 26) + 26) % 26;
        result += String.fromCharCode(offset + base);
        keyIndex++;
    }

    return result;
}

function vigenereEncrypt(text, key) {
    return vigenereCipher(text, key, false);
}

function vigenereDecrypt(text, key) {
    return vigenereCipher(text, key, true);
}

module.exports = { vigenereCipher, vigenereEncrypt, vigenereDecrypt };

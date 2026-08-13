function assertShift(shift) {
    if (!Number.isInteger(shift) || shift < 0 || shift > 25) {
        throw new Error("位移量必須 0 < 位移量 < 26 的整數");
    }
}

function assertText(text) {
    if (typeof text !== "string") {
        throw new Error("輸入字串");
    }
    if (text.length === 0) {
        throw new Error("不得為空");
    }
}

function shiftText(text, shiftAmount) {
    let result = "";

    for (const char of text) {
        const code = char.charCodeAt(0);
        let base = null;

        if (code >= 65 && code <= 90) {
            base = 65;
        } else if (code >= 97 && code <= 122) {
            base = 97;
        }

        if (base === null) {
            result += char;
            continue;
        }

        // 確保使用者在輸入的時候他的值會落在0~25間的整數上，如果 > 25 or < 0 就會用 % 26 取餘數，如果是負數就回傳：> ERROR：位移量必須是 0 到 25 的整數
        const offset = (((code - base + shiftAmount) % 26) + 26) % 26;
        result += String.fromCharCode(offset + base);
    }

    return result;
}

function caesarEncrypt(text, shift) {
    assertText(text);
    assertShift(shift);
    return shiftText(text, shift);
}

function caesarDecrypt(text, shift) {
    assertText(text);
    assertShift(shift);
    return shiftText(text, -shift);
}

function caesarBruteForce(text) {
    assertText(text);

    const results = [];
    for (let shift = 0; shift < 26; shift++) {
        results.push({
            shift: shift,
            result: shiftText(text, -shift)
        });
    }
    return results;
}

module.exports = { caesarEncrypt, caesarDecrypt, caesarBruteForce };

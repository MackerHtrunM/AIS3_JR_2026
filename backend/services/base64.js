 // base46 加解密ㄐ
function stripPadding(s) {
    return s.replace(/=+$/, "");
}

function encodeText(rawText) {
    if (typeof rawText !== "string") {
        throw new Error("輸入字串");
    }
    if (rawText.length === 0) {
        throw new Error("不得為空");
    }
    return Buffer.from(rawText, "utf-8").toString("base64");
}

function decodeText(b64String) {
    if (typeof b64String !== "string") {
        throw new Error("輸入必須是字串");
    }

    // 輸入的東西可以有換行或者空白
    const cleaned = b64String.replace(/\s/g, "");

    if (cleaned.length === 0) {
        throw new Error("輸入不得為空");
    }

    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) {
        throw new Error("含有非 Base64 字元");
    }

    const decoded = Buffer.from(cleaned, "base64").toString("utf-8");
    const backToB64 = Buffer.from(decoded, "utf-8").toString("base64");

    if (stripPadding(backToB64) !== stripPadding(cleaned)) {
        throw new Error("不是合法的 Base64 文字，或原始資料不是 UTF-8 文字");
    }

    return decoded;
}

module.exports = { encodeText, decodeText };

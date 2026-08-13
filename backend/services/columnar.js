 // 欄位加密

function normalizeKey(key) {
    if (typeof key !== "string") {
        throw new Error("金鑰必須是字串");
    }
    const trimmed = key.trim();
    if (trimmed.length === 0) {
        // 避免無窮迴圈
        throw new Error("金鑰不得為空");
    }
    if (!/^[A-Za-z]+$/.test(trimmed)) {
        throw new Error("金鑰只能包含英文字母");
    }
    return trimmed.toUpperCase();
}

function assertText(text) {
    if (typeof text !== "string") {
        throw new Error("輸入是字串");
    }
    if (text.trim().length === 0) {
        throw new Error("不得為空");
    }
}


 // 依金鑰字母的排序決定讀取欄位的順序。
function getColumnOrder(key) {
    const data = [];
    for (let i = 0; i < key.length; i++) {
        data.push({ letter: key[i], index: i });
    }

    data.sort(function (a, b) {
        if (a.letter === b.letter) return a.index - b.index;
        return a.letter < b.letter ? -1 : 1;
    });

    return data;
}

/** 計算每一欄實際有幾個字元 */
function getColumnLengths(textLength, columns) {
    const rows = Math.ceil(textLength / columns);
    const remainder = textLength % columns;
    const lengths = [];

    for (let i = 0; i < columns; i++) {
        lengths[i] = (remainder === 0 || i < remainder) ? rows : rows - 1;
    }
    return { rows, lengths };
}

function columnarEncrypt(text, key) {
    assertText(text);
    const normalizedKey = normalizeKey(key);

    const cleaned = text.replace(/\s/g, "");
    if (cleaned.length === 0) {
        throw new Error("移除空白後沒有可處理的內容");
    }

    const columns = normalizedKey.length;
    const order = getColumnOrder(normalizedKey);
    let result = "";

    for (const item of order) {
        for (let i = item.index; i < cleaned.length; i += columns) {
            result += cleaned[i];
        }
    }

    return result;
}

function columnarDecrypt(text, key) {
    assertText(text);
    const normalizedKey = normalizeKey(key);

    const cleaned = text.replace(/\s/g, "");
    if (cleaned.length === 0) {
        throw new Error("移除空白後沒有可處理的內容");
    }

    const columns = normalizedKey.length;
    if (columns > cleaned.length) {
        throw new Error("金鑰長度不可超過密文長度");
    }

    const { rows, lengths } = getColumnLengths(cleaned.length, columns);
    const order = getColumnOrder(normalizedKey);
    const columnData = [];
    let position = 0;

    for (const item of order) {
        const length = lengths[item.index];
        columnData[item.index] = cleaned.slice(position, position + length);
        position += length;
    }

    let result = "";
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            if (columnData[column] && row < columnData[column].length) {
                result += columnData[column][row];
            }
        }
    }

    return result;
}

module.exports = { columnarEncrypt, columnarDecrypt };

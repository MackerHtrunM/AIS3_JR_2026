const b64 = require("./base64.js");
const caesar = require("./caesar.js");
const col = require("./columnar.js");
const vig = require("./vigenere.js");

let pass = 0, fail = 0;

function check(label, fn, expected) {
    let actual;
    try {
        actual = fn();
    } catch (e) {
        actual = "例外:" + e.message;
    }
    const ok = actual === expected;
    console.log(`${ok ? "  ok  " : "  FAIL"} ${label}  => ${JSON.stringify(actual)}`);
    if (!ok) console.log(`         預期: ${JSON.stringify(expected)}`);
    ok ? pass++ : fail++;
}

function throws(label, fn) {
    try {
        fn();
        console.log(`  FAIL ${label} => 沒有丟出例外`);
        fail++;
    } catch (e) {
        console.log(`  ok   ${label} => 例外: ${e.message}`);
        pass++;
    }
}

console.log("===== base64（原本的 padding bug）=====");
["a", "ab", "abc", "abcd", "中文", "Hello World", "AIS3_JR"].forEach(s => {
    check(`往返 ${JSON.stringify(s)}`, () => b64.decodeText(b64.encodeText(s)), s);
});
check("解碼含空白換行", () => b64.decodeText("SGVsbG8g\nV29ybGQ="), "Hello World");
throws("非 Base64 字元", () => b64.decodeText("!!!!"));
throws("空輸入", () => b64.decodeText("   "));

console.log("\n===== caesar =====");
check("decrypt Khoor/3", () => caesar.caesarDecrypt("Khoor", 3), "Hello");
check("encrypt Hello/3", () => caesar.caesarEncrypt("Hello", 3), "Khoor");
check("保留非字母", () => caesar.caesarEncrypt("Hi, Bob!", 1), "Ij, Cpc!");
console.log("  bruteforce 鍵名:", Object.keys(caesar.caesarBruteForce("abc")[0]));
check("bruteforce shift3", () => caesar.caesarBruteForce("Khoor")[3].result, "Hello");
throws("shift 30", () => caesar.caesarDecrypt("abc", 30));
throws("shift -3", () => caesar.caesarDecrypt("abc", -3));
throws("shift 1.5", () => caesar.caesarDecrypt("abc", 1.5));
throws("shift 字串", () => caesar.caesarDecrypt("abc", "x"));

console.log("\n===== vigenere =====");
check("教科書測資", () => vig.vigenereEncrypt("ATTACKATDAWN", "LEMON"), "LXFOPVEFRNHR");
check("往返", () => vig.vigenereDecrypt(vig.vigenereEncrypt("Hello, World!", "Key"), "Key"), "Hello, World!");
check("大小寫金鑰等價", () => vig.vigenereEncrypt("HELLO", "lemon"), vig.vigenereEncrypt("HELLO", "LEMON"));
throws("金鑰含空白", () => vig.vigenereEncrypt("HELLO", "a b"));
throws("金鑰含數字", () => vig.vigenereEncrypt("HELLO", "a1"));
throws("金鑰為空", () => vig.vigenereEncrypt("HELLO", ""));

console.log("\n===== columnar =====");
check("教科書測資", () => col.columnarEncrypt("WEAREDISCOVEREDFLEEATONCE", "ZEBRAS"), "EVLNACDTESEAROFODEECWIREE");
[["ZEBRAS", "WEAREDISCOVEREDFLEEATONCE"],
 ["ZEBRAS", "SHORTX"],
 ["AAA", "ABCDEFG"],
 ["Key", "Hello World"]].forEach(([k, t]) => {
    check(`往返 key=${k}`, () => col.columnarDecrypt(col.columnarEncrypt(t, k), k), t.replace(/\s/g, ""));
});
throws("空金鑰（原本會無窮迴圈）", () => col.columnarDecrypt("ABCDEF", ""));
throws("金鑰比密文長", () => col.columnarDecrypt("HI", "ABCDEFGHIJ"));
throws("金鑰含數字", () => col.columnarEncrypt("ABC", "K3y"));

console.log(`\n===== 總計：通過 ${pass}，失敗 ${fail} =====`);
process.exit(fail === 0 ? 0 : 1);

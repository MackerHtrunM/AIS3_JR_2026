"use strict";

/* 共用工具*/

const PANELS = ["intro", "caesar", "vigenere", "columnar", "base64", "rsa", "cisco7"];

const TOOL_INPUTS = {
    caesar:   "inputText",
    vigenere: "vigenere-input",
    columnar: "columnar-input",
    base64:   "base64-input",
    rsa:      "rsa-c",
    cisco7:   "cisco7-input"
};

function showPanel(idToShow) {
    PANELS.forEach(function (id) {
        document.getElementById(id).classList.toggle("hidden", id !== idToShow);
    });
    window.scrollTo({ top: 0, behavior: "instant" });
}

function escapeHTML(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showError(targetId, message) {
    document.getElementById(targetId).innerHTML =
        '<span class="error">&gt; ERROR：' + escapeHTML(message) + "</span>";
}

function showLoading(targetId, message) {
    document.getElementById(targetId).innerHTML =
        '<span class="loading">&gt; ' + escapeHTML(message) + "</span>";
}

function showResult(targetId, text) {
    document.getElementById(targetId).innerHTML =
        '<span class="success">' + escapeHTML(text) + "</span>";
}

/*統一的 API 呼叫。*/
async function callApi(path, payload) {
    let response;
    try {
        response = await fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        throw new Error("無法連線到後端，請確認伺服器已啟動");
    }

    let json;
    try {
        json = await response.json();
    } catch (err) {
        throw new Error("伺服器回應格式錯誤（HTTP " + response.status + "）");
    }

    if (!response.ok || !json.success) {
        throw new Error(json.error || "伺服器錯誤（HTTP " + response.status + "）");
    }
    return json.data;
}



function bindAction(buttonId, busyLabel, task) {
    const button = document.getElementById(buttonId);
    button.addEventListener("click", async function () {
        const original = button.textContent;
        button.disabled = true;
        button.textContent = busyLabel;
        try {
            await task();
        } finally {
            button.disabled = false;
            button.textContent = original;
        }
    });
}

/** 只允許英文字母的金鑰 */
function isAlphaKey(value) {
    return /^[A-Za-z]+$/.test(value);
}

/* 卡片*/

PANELS.forEach(function (id) {
    document.getElementById("btn-" + id).addEventListener("click", function () {
        showPanel(id);
    });
});


document.querySelectorAll(".tool-card").forEach(function (card) {
    card.addEventListener("click", function () {
        showPanel(card.dataset.target);
    });
});

showPanel("intro");

/* 自動偵測*/

const detectResultBox = document.getElementById("detect-result");

function jumpToTool(tool, text) {
    const inputId = TOOL_INPUTS[tool];
    if (!inputId) return;

    showPanel(tool);
    const input = document.getElementById(inputId);
    input.value = text;
    input.focus();
}

function renderCandidates(candidates, sourceText) {
    if (!candidates || candidates.length === 0) {
        detectResultBox.innerHTML =
            '<p class="detect-hint">無法判斷這段文字屬於哪種編碼，請從下面自行選擇工具。</p>';
        return;
    }

    const list = document.createElement("div");
    list.className = "detect-list";

    candidates.forEach(function (item) {
        if (!TOOL_INPUTS[item.tool]) return;   

        const button = document.createElement("button");
        button.className = "detect-option";
        button.innerHTML =
            '<span class="opt-name">' + escapeHTML(item.label || item.tool) + "</span>" +
            '<span class="opt-reason">' + escapeHTML(item.reason || "") + "</span>";
        button.addEventListener("click", function () {
            jumpToTool(item.tool, sourceText);
        });
        list.appendChild(button);
    });

    detectResultBox.innerHTML = '<p class="detect-hint">可能是這些，點一下直接帶入：</p>';
    detectResultBox.appendChild(list);
}

async function runDetect() {
    const text = document.getElementById("detect-input").value;

    if (text.trim() === "") {
        detectResultBox.innerHTML =
            '<p class="detect-hint">請先貼上一段密文。</p>';
        return;
    }

    detectResultBox.innerHTML = '<p class="detect-hint">偵測中…</p>';
    try {
        const data = await callApi("/api/detect", { text: text });
        renderCandidates(data.candidates, text);
    } catch (err) {
        detectResultBox.innerHTML =
            '<p class="detect-hint error">' + escapeHTML(err.message) + "</p>";
    }
}

bindAction("detect-submit", "偵測中…", runDetect);


document.getElementById("detect-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        document.getElementById("detect-submit").click();
    }
});

/*凱撒密碼*/

const caesarModeSelect = document.getElementById("caesarMode");

function changeCaesarMode() {
    const isKnown = caesarModeSelect.value === "known";
    document.getElementById("shiftArea").classList.toggle("hidden", !isKnown);
}

caesarModeSelect.addEventListener("change", changeCaesarMode);
changeCaesarMode();  

async function runCaesar() {
    const text = document.getElementById("inputText").value;

    if (text.trim() === "") {
        showError("result", "請先輸入文字");
        return;
    }

    if (caesarModeSelect.value === "known") {
        const shiftInput = document.getElementById("shift").value;
        const shift = Number(shiftInput);

        if (
            shiftInput.trim() === "" ||
            !Number.isInteger(shift) ||
            shift < 0 ||
            shift > 25
        ) {
            showError("result", "位移量必須是 0 到 25 的整數");
            return;
        }

        showLoading("result", "處理中……");
        try {
            const data = await callApi("/api/caesar/decrypt", { text: text, shift: shift });
            document.getElementById("result").innerHTML =
                '<div class="result-item">' +
                '<span class="result-key">Shift ' + shift + "</span>" +
                '<span class="success">' + escapeHTML(data.result) + "</span>" +
                "</div>";
        } catch (err) {
            showError("result", err.message);
        }
    } else {
        showLoading("result", "暴力破解中…");
        try {
            const data = await callApi("/api/caesar/bruteforce", { text: text });
            let output = "";
            data.results.forEach(function (item) {
                output +=
                    '<div class="result-item">' +
                    '<span class="result-key">Shift ' + item.shift + "</span>" +
                    escapeHTML(item.result) +
                    "</div>";
            });
            document.getElementById("result").innerHTML = output;
        } catch (err) {
            showError("result", err.message);
        }
    }
}

bindAction("caesar-submit", "執行中…", runCaesar);

/* 維吉尼亞、欄位轉換*/

async function runKeyedCipher(config) {
    const text = document.getElementById(config.inputId).value;
    const key = document.getElementById(config.keyId).value.trim();
    const mode = document.getElementById(config.modeId).value;
    const target = config.resultId;

    if (text.trim() === "") {
        showError(target, "請先輸入文字");
        return;
    }
    if (key === "") {
        showError(target, "請先輸入金鑰");
        return;
    }
    if (!isAlphaKey(key)) {
        showError(target, "金鑰只能包含英文字母");
        return;
    }

    showLoading(target, "處理中…");
    try {
        const data = await callApi(config.basePath + "/" + mode, { text: text, key: key });
        showResult(target, data.result);
    } catch (err) {
        showError(target, err.message);
    }
}

const VIGENERE = {
    inputId:  "vigenere-input",
    keyId:    "vigenere-key",
    modeId:   "vigenere-mode",
    resultId: "vigenere-result",
    basePath: "/api/vigenere"
};

const COLUMNAR = {
    inputId:  "columnar-input",
    keyId:    "columnar-key",
    modeId:   "columnar-mode",
    resultId: "columnar-result",
    basePath: "/api/columnar"
};

bindAction("vigenere-submit", "執行中…", function () {
    return runKeyedCipher(VIGENERE);
});

bindAction("columnar-submit", "執行中…", function () {
    return runKeyedCipher(COLUMNAR);
});

/*Base64*/

async function runBase64() {
    const input = document.getElementById("base64-input").value;
    const mode = document.getElementById("base64-mode").value;

    if (input.trim() === "") {
        showError("base64-result", "請先輸入文字");
        return;
    }


    const path = mode === "encode" ? "/api/base64/encode" : "/api/base64/decode";
    const payload = mode === "encode" ? { text: input } : { b64_string: input };

    showLoading("base64-result", "處理中…");
    try {
        const data = await callApi(path, payload);
        showResult("base64-result", data.result);
    } catch (err) {
        showError("base64-result", err.message);
    }
}

bindAction("base64-submit", "執行中…", runBase64);





/* RSA*/

/** 只允許十進位正整數*/
function isPositiveInteger(value) {
    return /^[1-9][0-9]*$/.test(value);
}

async function runRSA() {
    const n = document.getElementById("rsa-n").value.trim();
    const e = document.getElementById("rsa-e").value.trim();
    const c = document.getElementById("rsa-c").value.trim();

    const fields = [
        { label: "模數 N", value: n },
        { label: "公鑰 e", value: e },
        { label: "密文 c", value: c }
    ];

    for (const field of fields) {
        if (field.value === "") {
            showError("rsa-result", "請填入「" + field.label + "」");
            return;
        }
        if (!isPositiveInteger(field.value)) {
            showError("rsa-result", "「" + field.label + "」必須是十進位正整數");
            return;
        }
    }

    showLoading("rsa-result", "分解中，大數可能需要一段時間…");
    try {
        const data = await callApi("/api/rsa/crack", { n: n, e: e, c: c });

        const rows = [
            ["p", data.p],
            ["q", data.q],
            ["d", data.d],
            ["m", data.m],
            ["明文", data.plaintext]
        ];

        let output = "";
        rows.forEach(function (row) {
            if (row[1] === undefined || row[1] === null) return;
            output +=
                '<div class="result-item">' +
                '<span class="result-key">' + escapeHTML(row[0]) + "</span>" +
                '<span class="success">' + escapeHTML(row[1]) + "</span>" +
                "</div>";
        });

        document.getElementById("rsa-result").innerHTML =
            output || '<span class="error">後端沒有回傳可顯示的欄位</span>';
    } catch (err) {
        showError("rsa-result", err.message);
    }
}

bindAction("rsa-submit", "破解中…", runRSA);

/*Cisco IOS Type 7*/

async function runCisco7() {
    const input = document.getElementById("cisco7-input").value;

    if (input.trim() === "") {
        showError("cisco7-result", "請先輸入加密字串");
        return;
    }

    showLoading("cisco7-result", "還原中…");
    try {
        const data = await callApi("/api/cisco7/decrypt", { text: input });
        showResult("cisco7-result", data.result);
    } catch (err) {
        showError("cisco7-result", err.message);
    }
}

bindAction("cisco7-submit", "還原中…", runCisco7);

/* 首頁打字動畫*/

const targetText = "AIS3_JR_Crypto_tool";
const typingBox = document.getElementById("decrypt-text");

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typingBox.textContent = targetText;
} else {
    let charIndex = 0;
    (function typeText() {
        if (charIndex < targetText.length) {
            typingBox.textContent += targetText[charIndex];
            charIndex++;
            setTimeout(typeText, 100);
        }
    })();
}

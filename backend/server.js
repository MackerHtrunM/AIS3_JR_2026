'use strict';

const express = require('express');
const apiRouter = require('./routes/api');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));
app.use('/api', apiRouter);




// 統一的 404 / 錯誤處理
// 一定要回 JSON——前端的 callApi() 會直接 response.json()，
// 收到 HTML 錯誤頁會變成「伺服器回應格式錯誤」這種難以除錯的訊息。
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: `找不到路由: ${req.method} ${req.originalUrl}`,
  });
});

// eslint-disable-next-line no-unused-vars -- Express 靠 4 個參數辨識 error handler
app.use((err, req, res, next) => {
  console.error('[backend] unhandled error:', err);

  // express.json() 遇到壞掉的 JSON 會丟這個
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      data: null,
      error: '請求內容不是合法的 JSON',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    data: null,
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[backend] API server listening on http://0.0.0.0:${PORT}`);
});

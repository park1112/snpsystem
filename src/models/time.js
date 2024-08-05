// src/models/time.js
export function getKoreaTime() {
  // 현재 UTC 시간 계산
  const nowUTC = Date.now();
  // UTC 기준으로 한국 시간 계산 (UTC+9)
  const koreaTime = new Date(nowUTC + 9 * 60 * 60 * 1000);
  return koreaTime;
}

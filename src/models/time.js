// models/time.js

export function getKoreaTime() {
  const nowUTC = Date.now();
  const koreaTime = new Date(nowUTC + 9 * 60 * 60 * 1000);
  return koreaTime;
}

export function formatKoreaTime(date) {
  const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return koreaTime.toISOString().split('T')[0];
}

export function parseKoreaTime(dateString) {
  const date = new Date(dateString);
  return new Date(date.getTime() - 9 * 60 * 60 * 1000);
}
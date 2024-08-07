// src/utils/inventoryStatus.js

// INVENTORY_STATUS 객체에 새로운 상태 추가
export const INVENTORY_STATUS = {
  RECEIVING: 'RECEIVING', // 입고 추가
  PRODUCTION: 'PRODUCTION',
  STOCK: 'STOCK',
  SHIPPING: 'SHIPPING',
};

// INVENTORY_STATUS_KOREAN 객체에 입고 상태 추가
export const INVENTORY_STATUS_KOREAN = {
  // [INVENTORY_STATUS.RECEIVING]: '입고', // 입고 추가
  // [INVENTORY_STATUS.PRODUCTION]: '생산',
  [INVENTORY_STATUS.STOCK]: '재고',
  // [INVENTORY_STATUS.SHIPPING]: '출고',
};

export const getKoreanStatus = (status) => {
  return INVENTORY_STATUS_KOREAN[status] || status;
};

export const getEnglishStatus = (koreanStatus) => {
  return (
    Object.keys(INVENTORY_STATUS_KOREAN).find((key) => INVENTORY_STATUS_KOREAN[key] === koreanStatus) || koreanStatus
  );
};

// // INVENTORY_STATUS_KOREAN 객체에 입고 상태 추가
// export const INVENTORY_STATUS_KOREAN = {
//   [INVENTORY_STATUS.RECEIVING]: '입고', // 입고 추가
//   [INVENTORY_STATUS.PRODUCTION]: '생산',
//   [INVENTORY_STATUS.STOCK]: '재고',
//   [INVENTORY_STATUS.SHIPPING]: '출고',
// };



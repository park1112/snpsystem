// src/utils/inventoryStatus.js

// INVENTORY_STATUS 객체에 새로운 상태 추가
export const INVENTORY_STATUS = {
  RECEIVING: 'RECEIVING',// 예약된
  INBOUND: 'INBOUND', // 입고 추가
  OUTBOUND: 'OUTBOUND',// 출고
  STOCK: 'STOCK', //생산재고
  PRODUCTION: 'PRODUCTION', //생산 
  SHIPPING: 'SHIPPING', //판매 
};

// INVENTORY_STATUS_KOREAN 객체에 입고 상태 추가
export const INVENTORY_STATUS_KOREAN = {
  // [INVENTORY_STATUS.RECEIVING]: '입고', // 입고 추가
  // [INVENTORY_STATUS.PRODUCTION]: '생산',
  [INVENTORY_STATUS.STOCK]: '재고',
  // [INVENTORY_STATUS.SHIPPING]: '출고',
};

// INVENTORY_STATUS_KOREAN 객체에 입고 상태 추가
export const INBOUND_STATUS_KOREAN = {
  [INVENTORY_STATUS.INBOUND]: '입고', // 입고 추가
  // [INVENTORY_STATUS.PRODUCTION]: '생산',
  // [INVENTORY_STATUS.stock]: '재고',
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



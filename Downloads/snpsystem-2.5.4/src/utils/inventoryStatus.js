// src/utils/inventoryStatus.js

export const INVENTORY_STATUS = {
  STOCK: 'stock',
  PRODUCTION: 'production',
  SHIPPING: 'shipping',
};

export const INVENTORY_STATUS_KOREAN = {
  [INVENTORY_STATUS.STOCK]: '재고',
  [INVENTORY_STATUS.PRODUCTION]: '생산',
  [INVENTORY_STATUS.SHIPPING]: '출고',
};

export const getKoreanStatus = (status) => {
  return INVENTORY_STATUS_KOREAN[status] || status;
};

export const getEnglishStatus = (koreanStatus) => {
  return (
    Object.keys(INVENTORY_STATUS_KOREAN).find((key) => INVENTORY_STATUS_KOREAN[key] === koreanStatus) || koreanStatus
  );
};

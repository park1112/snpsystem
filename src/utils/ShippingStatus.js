// src/utils/ShippingStatus.js

export const SHIPPING_STATUS = {
  SHIPPED: '출고',
  PENDING_SETTLEMENT: '정산예정',
  SETTLED: '정산완료',
};

export function getStatusInKorean(status) {
  return SHIPPING_STATUS[status] || 'Unknown';
}

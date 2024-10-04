export const getKoreanStatus = (status) => {
    switch (status) {
        case 'RECEIVING':
            return '예약됨';
        case 'INBOUND':
            return '입고';
        case 'OUTBOUND':
            return '출고';
        case 'STOCK':
            return '생산재고';
        case 'PRODUCTION':
            return '생산';
        case 'SHIPPING':
            return '판매';
        case 'available':
            return '사용 가능';
        default:
            return '알 수 없음';
    }
};

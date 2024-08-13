export const getKoreanStatus = (status) => {
    switch (status) {
        case 'reserved':
            return '예약됨';
        case 'inbound':
            return '입고';
        case 'outbound':
            return '출고';
        case 'stock':
            return '생산재고';
        case 'production':
            return '생산';
        case 'available':
            return '사용 가능';
        default:
            return '알 수 없음';
    }
};

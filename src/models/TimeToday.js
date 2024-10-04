// src/models/Inventory.js
import dayjs from 'dayjs';

class Inventory {
    constructor({ id, warehouseName, productName, quantity, logisticsName, logisticsQuantity, createdAt }) {
        this.id = id || '';
        this.warehouseName = warehouseName || 'N/A';
        this.productName = productName || 'N/A';
        this.quantity = quantity || 'N/A';
        this.logisticsName = logisticsName || 'N/A';
        this.logisticsQuantity = logisticsQuantity || 'N/A';
        this.createdAt = createdAt ? dayjs(createdAt) : null;
    }

    // 날짜를 포맷팅하는 메서드
    getFormattedCreatedAt() {
        if (!this.createdAt) return 'N/A';
        const today = dayjs().startOf('day');
        if (this.createdAt.isSame(today, 'day')) {
            return this.createdAt.format('HH:mm');
        }
        return this.createdAt.format('YYYY-MM-DD HH:mm');
    }

    static fromFirestore(doc) {
        const data = doc.data();
        return new Inventory({
            id: doc.id,
            warehouseName: data.warehouseName,
            productName: data.productName,
            quantity: data.quantity,
            logisticsName: data.logisticsName,
            logisticsQuantity: data.logisticsQuantity,
            createdAt: data.createdAt ? data.createdAt.toDate() : null,
        });
    }
}

export default Inventory;

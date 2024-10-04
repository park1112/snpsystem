// src/models/Partner.js
import { Timestamp } from 'firebase/firestore';
import { getKoreaTime } from './time';

class Partner {
  constructor({
    category = '',
    lastPalletQuantity = 0,
    lastShippingDate = '',
    lastTotalQuantity = 0,
    master = '',
    accountNumber = '',
    name = '',
    paymentMethod = '',
    phone = '',
    shippingHistory = [], // 초기값은 빈 배열
    createdAt = getKoreaTime().toISOString(), // Default to current Korea time
    updatedAt = getKoreaTime().toISOString(), // Default to current Korea time
  } = {}) {
    this.category = category;
    this.lastPalletQuantity = lastPalletQuantity;
    this.lastShippingDate = lastShippingDate;
    this.lastTotalQuantity = lastTotalQuantity;
    this.master = master;
    this.accountNumber = accountNumber;
    this.name = name;
    this.paymentMethod = paymentMethod;
    this.phone = phone;
    this.shippingHistory = shippingHistory; // 현재는 사용하지 않지만, 추후 업데이트 가능
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(docData) {
    return new Partner({
      ...docData,
      createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : '',
      updatedAt: docData.updatedAt?.toDate ? docData.updatedAt.toDate().toISOString() : '',
      lastShippingDate: docData.lastShippingDate || '',
    });
  }

  toFirestore() {
    const now = getKoreaTime().toISOString(); // 한국 시간으로 현재 시간 설정
    return {
      category: this.category,
      lastPalletQuantity: this.lastPalletQuantity,
      lastShippingDate: this.lastShippingDate,
      lastTotalQuantity: this.lastTotalQuantity,
      master: this.master,
      accountNumber: this.accountNumber,
      name: this.name,
      paymentMethod: this.paymentMethod,
      phone: this.phone,
      shippingHistory: this.shippingHistory, // 저장은 빈 배열로 하되 추후 업데이트 시 사용
      createdAt: this.createdAt || now,
      updatedAt: Timestamp.fromDate(new Date(now)),
    };
  }
}

export default Partner;

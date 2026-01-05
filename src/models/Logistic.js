// src/models/Logistic.js
import { Timestamp } from 'firebase/firestore';
import { getKoreaTime } from './time';

class Logistic {
  constructor({
    name = '',
    category = '',
    quantity = 1,
    price = 0,
    sameAsProductQuantity = false,
    partnerId = '',
    partnerName = '',
    accountNumber = '',
    createdAt = getKoreaTime().toISOString(), // Default to current Korea time
    updatedAt = getKoreaTime().toISOString(), // Default to current Korea time
  } = {}) {
    this.name = name;
    this.category = category;
    this.quantity = quantity;
    this.price = price;
    this.sameAsProductQuantity = sameAsProductQuantity;
    this.partnerId = partnerId;
    this.partnerName = partnerName;
    this.accountNumber = accountNumber;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(docData) {
    return new Logistic({
      ...docData,
      createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : '',
      updatedAt: docData.updatedAt?.toDate ? docData.updatedAt.toDate().toISOString() : '',
    });
  }

  toFirestore() {
    return {
      name: this.name,
      category: this.category,
      quantity: this.quantity,
      price: this.price,
      sameAsProductQuantity: this.sameAsProductQuantity,
      partnerId: this.partnerId,
      partnerName: this.partnerName,
      accountNumber: this.accountNumber,
      createdAt: Timestamp.fromDate(new Date(this.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(getKoreaTime().toISOString())), // Always update with current Korea time
    };
  }
}

export default Logistic;

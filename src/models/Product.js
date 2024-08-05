// src/models/Product.js
import { Timestamp } from 'firebase/firestore';
import { getKoreaTime } from './time';

class Product {
  constructor({
    name = '',
    category = '',
    subCategory = '',
    weight = '',
    typeName = '',
    price = 0,
    quantity = 0,
    logistics = [],
    createdAt = getKoreaTime().toISOString(), // Default to current Korea time
    updatedAt = getKoreaTime().toISOString(), // Default to current Korea time
  } = {}) {
    this.name = name;
    this.category = category;
    this.subCategory = subCategory;
    this.weight = weight;
    this.typeName = typeName;
    this.price = price;
    this.quantity = quantity;
    this.logistics = logistics;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(docData) {
    return new Product({
      ...docData,
      createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : '',
      updatedAt: docData.updatedAt?.toDate ? docData.updatedAt.toDate().toISOString() : '',
    });
  }

  toFirestore() {
    const now = getKoreaTime().toISOString();
    return {
      name: this.name,
      category: this.category,
      subCategory: this.subCategory,
      weight: this.weight,
      typeName: this.typeName,
      price: parseFloat(this.price),
      quantity: parseInt(this.quantity),
      logistics: this.logistics.map((logistic) => ({
        uid: logistic.uid,
        name: logistic.name,
        unit: logistic.unit,
        sameAsProductQuantity: logistic.sameAsProductQuantity,
      })),
      createdAt: Timestamp.fromDate(new Date(this.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(now)),
    };
  }
}

export default Product;

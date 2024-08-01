// src/models/Product.js
class Product {
  constructor({ name = '', category = '', weight = '', typeName = '', price = 0, quantity = 0, logistics = [], createdAt = '', updatedAt = '' } = {}) {
    this.name = name;
    this.category = category;
    this.weight = weight;
    this.typeName = typeName;
    this.price = price;
    this.quantity = quantity;
    this.logistics = logistics;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(docData) {
    return new Product(docData);
  }


  toFirestore() {
    const now = new Date().toISOString(); // 현재 시간을 ISO 문자열로 설정
    return {
      name: this.name,
      category: this.category,
      weight: this.weight,
      typeName: this.typeName,
      price: parseFloat(this.price),
      quantity: parseInt(this.quantity),
      logistics: this.logistics.map(logistic => ({
        uid: logistic.uid,
        name: logistic.name, // Ensure name is included here
        unit: logistic.unit,
      })),
      createdAt: this.createdAt || now,
      updatedAt: now,
    };
  }
}

export default Product;

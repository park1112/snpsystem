const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// HTTP 요청 함수 예시
exports.myFunction = onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

// Firestore 트리거 함수 예시
exports.onNewTransaction = onDocumentCreated("transactions/{transactionId}", (event) => {
    console.log("New transaction:", event.params.transactionId);
    // 여기에 트랜잭션 생성 시 실행할 로직을 작성합니다.
});



exports.updateInventory = functions.firestore
    .document('transactions/{transactionId}')
    .onCreate(async (snap, context) => {
        const transaction = snap.data();
        const warehouseId = transaction.warehouseId;
        const logisticsDevices = transaction.logisticsDevices;
        const products = transaction.products;

        const warehouseRef = admin.firestore().collection('warehouses').doc(warehouseId);
        const logisticsRef = admin.firestore().collection('logisticsDevices');
        const productsRef = admin.firestore().collection('products');

        await admin.firestore().runTransaction(async (t) => {
            const warehouseDoc = await t.get(warehouseRef);

            // 창고의 물류기기 재고 업데이트
            const updatedLogisticsDevices = warehouseDoc.data().logisticsDevices.map(device => {
                const matchedDevice = logisticsDevices.find(d => d.deviceId === device.deviceId);
                if (matchedDevice) {
                    return { ...device, quantity: device.quantity - matchedDevice.quantity };
                }
                return device;
            });

            // 창고의 상품 재고 업데이트
            const updatedProducts = warehouseDoc.data().products.map(product => {
                const matchedProduct = products.find(p => p.productId === product.productId);
                if (matchedProduct) {
                    return { ...product, quantity: product.quantity - matchedProduct.quantity };
                }
                return product;
            });

            // 트랜잭션을 통해 재고 업데이트
            t.update(warehouseRef, { logisticsDevices: updatedLogisticsDevices, products: updatedProducts });
        });
    });

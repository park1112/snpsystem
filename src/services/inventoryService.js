import { getDocs, addDoc, getDoc, collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';

export const fetchProducts = async () => {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    return productsSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
    }));
};

export const fetchLogisticsByProductUid = async (productUid) => {
    const productRef = doc(db, 'products', productUid);
    const productDoc = await getDoc(productRef);

    if (productDoc.exists()) {
        return productDoc.data().logistics || [];
    } else {
        throw new Error('Product not found');
    }
};






export const submitInventoryTransaction = async (formState, initialData, setLogs) => {
    const inventoryUid = doc(collection(db, 'inventories')).id; // 새로운 inventory UID를 생성합니다.

    await runTransaction(db, async (transaction) => {
        const warehouseUid = formState.warehouseUid || initialData.warehouseUId || initialData.warehouseUid;
        if (!warehouseUid) {
            throw new Error('Warehouse UID is missing');
        }

        const warehouseRef = doc(db, 'warehouses', warehouseUid);
        const inventoryRef = doc(db, 'inventories', inventoryUid); // 이곳에서 생성한 inventoryUid를 사용합니다.

        const warehouseDoc = await transaction.get(warehouseRef);
        if (!warehouseDoc.exists()) {
            throw new Error('Warehouse does not exist');
        }

        const warehouseData = warehouseDoc.data();
        if (!warehouseData.statuses) {
            warehouseData.statuses = {};
        }
        if (!warehouseData.statuses[formState.status]) {
            warehouseData.statuses[formState.status] = { products: {} };
        }
        const statusData = warehouseData.statuses[formState.status];

        const newInventoryData = {
            warehouseUid,
            warehouseName: formState.warehouseName || initialData.warehouseName,
            status: formState.status,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            teamUid: formState.teamUid || initialData.teamUid,
            teamName: formState.teamName || initialData.teamName,
            products: formState.products.map(product => ({
                productUid: product.productUid,
                productName: product.productName,
                quantity: parseInt(product.quantity, 10)
            })),
            logistics: formState.logistics,  // 물류기기 정보 추가
        };

        // 새로운 인벤토리 문서 생성
        transaction.set(inventoryRef, newInventoryData);

        newInventoryData.products.forEach(product => {
            if (!statusData.products[product.productUid]) {
                statusData.products[product.productUid] = {
                    name: product.productName,
                    count: product.quantity,
                    inventoryUids: [inventoryUid]
                };
            } else {
                statusData.products[product.productUid].count += product.quantity;
                statusData.products[product.productUid].inventoryUids.push(inventoryUid);
            }
        });

        transaction.update(warehouseRef, {
            [`statuses.${formState.status}`]: statusData,
        });

        setLogs((prevLogs) => {
            return [{ ...newInventoryData, id: inventoryUid }, ...prevLogs].slice(0, 20);
        });
    });

    return inventoryUid; // 생성한 inventoryUid를 반환합니다.
};

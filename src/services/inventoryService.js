import { getDocs, addDoc, query, where, deleteDoc, getDoc, collection, doc, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { deleteInventoryItem } from '../components/WarehouseInventoryManager';
import LogisticsItem from '../models/LogisticsItem';



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

export const deleteInventoryTransaction = async (inventoryUid) => {
    await runTransaction(db, async (transaction) => {
        const inventoryRef = doc(db, 'inventories', inventoryUid);
        const inventoryDoc = await transaction.get(inventoryRef);

        if (!inventoryDoc.exists()) {
            throw new Error('Inventory does not exist');
        }

        const inventoryData = inventoryDoc.data();
        const warehouseUid = inventoryData.warehouseUid;
        const status = inventoryData.status;

        const warehouseRef = doc(db, 'warehouses', warehouseUid);
        const warehouseDoc = await transaction.get(warehouseRef);

        if (!warehouseDoc.exists()) {
            throw new Error('Warehouse does not exist');
        }

        const warehouseData = warehouseDoc.data();
        const statusData = warehouseData.statuses[status];
        const logistics = warehouseData.logistics || {};

        // Remove products from warehouse status
        inventoryData.products.forEach((product) => {
            if (statusData.products[product.productUid]) {
                statusData.products[product.productUid].count -= product.quantity;

                if (statusData.products[product.productUid].count <= 0) {
                    delete statusData.products[product.productUid];
                } else {
                    statusData.products[product.productUid].inventoryUids =
                        statusData.products[product.productUid].inventoryUids.filter(uid => uid !== inventoryUid);
                }
            }
        });


        // 인벤토리의 물류기기들의 수량을 창고 컬렉션에서 감소
        await Promise.all(inventoryData.logistics.map(async (logistic) => {
            if (logistics[logistic.uid]) {
                const logisticsItem = LogisticsItem.fromFirestore(logistics[logistic.uid]);
                console.log('logisticsItem = ', logisticsItem);

                // logistics_movements에서 해당 inventory_uid와 logistics_uid를 가진 문서 찾기
                const movementsQuery = query(
                    collection(db, 'logistics_movements'),
                    where('inventory_uid', '==', inventoryUid),
                    where('logistics_uid', '==', logistic.uid)
                );
                const movementsSnapshot = await getDocs(movementsQuery);

                movementsSnapshot.forEach((doc) => {
                    const movementData = doc.data();
                    logisticsItem.removeMovement(doc.id); // doc.id를 movementId로 사용
                });

                if (logisticsItem.isEmpty()) {
                    delete logistics[logistic.uid];
                } else {
                    logistics[logistic.uid] = logisticsItem.toFirestore();
                }
            }
        }));


        // Update the warehouse document
        transaction.update(warehouseRef, {
            [`statuses.${status}`]: statusData,
            logistics: logistics,
        });

        // Delete related logistics movements
        const logisticsMovementsRef = collection(db, 'logistics_movements');
        const logisticsMovementsQuery = query(logisticsMovementsRef, where('inventory_uid', '==', inventoryUid));
        const logisticsMovementsSnapshot = await getDocs(logisticsMovementsQuery);

        logisticsMovementsSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });

        // Finally, delete the inventory document
        transaction.delete(inventoryRef);
    });
};


export const updateInventoryTransaction = async (inventoryUid, updatedFormState, setLogs) => {
    await runTransaction(db, async (transaction) => {
        console.log('inventoryUid', inventoryUid);
        console.log('updatedFormState', updatedFormState);

        const inventoryRef = doc(db, 'inventories', inventoryUid);
        const inventoryDoc = await transaction.get(inventoryRef);

        if (!inventoryDoc.exists()) {
            throw new Error('Inventory does not exist');
        }

        const inventoryData = inventoryDoc.data();
        const warehouseUid = inventoryData.warehouseUid;
        const status = inventoryData.status;

        const warehouseRef = doc(db, 'warehouses', warehouseUid);
        const warehouseDoc = await transaction.get(warehouseRef);

        if (!warehouseDoc.exists()) {
            throw new Error('Warehouse does not exist');
        }

        const warehouseData = warehouseDoc.data();
        const statusData = warehouseData.statuses[status];
        // const logistics = warehouseData.logistics || {};

        // 기존 제품 데이터를 제거하기 전에 새 데이터로 업데이트
        inventoryData.products.forEach((product) => {
            if (statusData.products[product.productUid]) {
                statusData.products[product.productUid].count -= product.quantity;

                if (statusData.products[product.productUid].count <= 0) {
                    delete statusData.products[product.productUid];
                } else {
                    statusData.products[product.productUid].inventoryUids =
                        statusData.products[product.productUid].inventoryUids.filter(uid => uid !== inventoryUid);
                }
            }
        });

        // 업데이트된 제품 데이터 적용
        const updatedInventoryData = {
            ...inventoryData,
            status: updatedFormState.status || inventoryData.status,
            updatedAt: Timestamp.fromDate(new Date()),
            products: updatedFormState.products.map(product => ({
                productUid: product.productUid,
                productName: product.productName,
                quantity: parseInt(product.quantity, 10)
            })),
            logistics: updatedFormState.logistics,  // 물류기기 정보도 업데이트
        };

        updatedInventoryData.products.forEach(product => {
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

        transaction.update(inventoryRef, updatedInventoryData);

        // // 물류기기 정보 업데이트
        // await Promise.all(updatedInventoryData.logistics.map(async (logistic) => {
        //     if (logistics[logistic.uid]) {
        //         const logisticsItem = LogisticsItem.fromFirestore(logistics[logistic.uid]);

        //         // logistics_movements에서 해당 inventory_uid와 logistics_uid를 가진 문서 업데이트
        //         const movementsQuery = query(
        //             collection(db, 'logistics_movements'),
        //             where('inventory_uid', '==', inventoryUid),
        //             where('logistics_uid', '==', logistic.uid)
        //         );
        //         const movementsSnapshot = await getDocs(movementsQuery);

        //         movementsSnapshot.forEach((doc) => {
        //             const movementData = doc.data();
        //             logisticsItem.updateMovement(doc.id, updatedInventoryData); // 기존 문서에 대한 업데이트 수행
        //         });

        //         logistics[logistic.uid] = logisticsItem.toFirestore();
        //     }
        // }));

        // transaction.update(warehouseRef, {
        //     [`statuses.${status}`]: statusData,
        //     logistics: logistics,
        // });

        setLogs((prevLogs) => {
            return [{ ...updatedInventoryData, id: inventoryUid }, ...prevLogs].slice(0, 20);
        });
    });
};

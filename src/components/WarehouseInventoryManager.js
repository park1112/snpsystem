import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import LogisticsItem from '../models/LogisticsItem';
import { db } from '../utils/firebase';

export const updateWarehouseInventory = async (warehouseId, logisticsItems) => {
    const warehouseRef = doc(db, 'warehouses', warehouseId);

    await runTransaction(db, async (transaction) => {
        const warehouseDoc = await transaction.get(warehouseRef);

        if (!warehouseDoc.exists()) {
            throw new Error("Warehouse does not exist");
        }

        const data = warehouseDoc.data();
        const logistics = data.logistics || {};

        logisticsItems.forEach((item) => {
            const { logisticsItemId, logisticsItemName, quantity, movementType, movementId } = item;

            let logisticsItem = logistics[logisticsItemId]
                ? LogisticsItem.fromFirestore(logistics[logisticsItemId])
                : new LogisticsItem({ name: logisticsItemName });

            // 물류기기 이름 업데이트
            logisticsItem.updateName(logisticsItemName);

            const newMovement = {
                movementId,
                state: movementType,
                quantity,
                date: new Date()
            };

            logisticsItem.addMovement(newMovement);

            logistics[logisticsItemId] = logisticsItem.toFirestore();
        });

        transaction.update(warehouseRef, {
            logistics: logistics,
            lastUpdated: serverTimestamp()
        });
    });
};




export const updateOrDeleteMovement = async (warehouseId, logisticsItemId, oldMovement, newMovement = null, newWarehouseId = null) => {
    const warehouseRef = doc(db, 'warehouses', warehouseId);
    const newWarehouseRef = newWarehouseId ? doc(db, 'warehouses', newWarehouseId) : null;

    await runTransaction(db, async (transaction) => {
        const warehouseDoc = await transaction.get(warehouseRef);
        if (!warehouseDoc.exists()) {
            throw new Error("Warehouse does not exist");
        }

        const data = warehouseDoc.data();
        const logistics = data.logistics || {};
        let item = logistics[logisticsItemId]
            ? LogisticsItem.fromFirestore(logistics[logisticsItemId])
            : new LogisticsItem({ name: logisticsItemId }); // 여기 수정

        // oldMovement 처리 (삭제 작업)
        item.removeMovement(oldMovement.movementId);

        // 재고가 0이 되고 입출고 기록이 없으면 해당 아이템을 인벤토리에서 제거
        if (item.isEmpty()) {
            delete logistics[logisticsItemId]; // 여기 수정
        } else {
            logistics[logisticsItemId] = item.toFirestore();
        }

        // 창고 문서 업데이트
        transaction.update(warehouseRef, {
            logistics: logistics,
            lastUpdated: serverTimestamp()
        });

        // 새 창고로 이동하는 경우
        if (newWarehouseRef && newMovement) {
            const newWarehouseDoc = await transaction.get(newWarehouseRef);
            if (!newWarehouseDoc.exists()) {
                throw new Error("New Warehouse does not exist");
            }

            const newWarehouseData = newWarehouseDoc.data();
            const newLogistics = newWarehouseData.logistics || {};
            let newItem = newLogistics[logisticsItemId]
                ? LogisticsItem.fromFirestore(newLogistics[logisticsItemId])
                : new LogisticsItem({ name: logisticsItemId }); // 여기 수정

            newItem.addMovement(newMovement);

            newLogistics[logisticsItemId] = newItem.toFirestore();

            transaction.update(newWarehouseRef, {
                [`logistics.${logisticsItemId}`]: newItem.toFirestore(),
                lastUpdated: serverTimestamp()
            });
        }

    });
};

export const updateMovement = async (warehouseId, logisticsItemId, oldMovement, newMovement, newWarehouseId = null) => {
    console.log('이동하는 정보:', newMovement);

    if (newWarehouseId && newWarehouseId !== warehouseId) {
        // 다른 창고로 이동하는 경우

        await updateOrDeleteMovement(warehouseId, logisticsItemId, oldMovement, null);
        await updateWarehouseInventory(newWarehouseId, logisticsItemId, newMovement.name, newMovement.quantity, newMovement.state, newMovement.movementId);
    } else {
        // 같은 창고 내에서 수정하는 경우
        const warehouseRef = doc(db, 'warehouses', warehouseId);

        await runTransaction(db, async (transaction) => {
            const warehouseDoc = await transaction.get(warehouseRef);
            if (!warehouseDoc.exists()) {
                throw new Error("Warehouse does not exist");
            }

            const data = warehouseDoc.data();
            const logistics = data.logistics || {};
            let item = logistics[logisticsItemId]
                ? LogisticsItem.fromFirestore(logistics[logisticsItemId])
                : new LogisticsItem({ name: logisticsItemId }); // 여기 수정

            // 기존 움직임 제거
            item.removeMovement(oldMovement.movementId);

            // 새로운 움직임 추가
            item.addMovement(newMovement);

            logistics[logisticsItemId] = item.toFirestore();

            // 창고 문서 업데이트
            transaction.update(warehouseRef, {
                [`logistics.${logisticsItemId}`]: item.toFirestore(),
                lastUpdated: serverTimestamp()
            });
        });
    }
};

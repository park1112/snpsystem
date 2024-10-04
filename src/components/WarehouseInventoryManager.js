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
            const { logisticsItemId, logisticsItemName, quantity, movementType, movementId, inventoryId } = item;

            let logisticsItem = logistics[logisticsItemId]
                ? LogisticsItem.fromFirestore(logistics[logisticsItemId])
                : new LogisticsItem({ name: logisticsItemName });

            // 물류기기 이름 업데이트
            logisticsItem.updateName(logisticsItemName);

            const newMovement = {
                movementId,
                state: movementType,
                quantity,
                date: new Date(),
                inventoryId,

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

export const editWarehouseInventory = async (warehouseId, logisticsItems, logisticsInit) => {
    const warehouseRef = doc(db, 'warehouses', warehouseId);

    await runTransaction(db, async (transaction) => {
        const warehouseDoc = await transaction.get(warehouseRef);

        if (!warehouseDoc.exists()) {
            throw new Error("Warehouse does not exist");
        }

        const data = warehouseDoc.data();
        let logistics = data.logistics || {};

        console.log('Initial logistics:', logistics);

        // logisticsInit 처리
        if (Array.isArray(logisticsInit.current)) {
            logisticsInit.current.forEach(initItem => {
                if (logistics[initItem.uid]) {
                    let logisticsItem = LogisticsItem.fromFirestore(logistics[initItem.uid]);

                    // 기존 움직임 중 inventoryId가 일치하는 것을 찾아 수량 감소
                    const movementIndex = logisticsItem.lastMovements.findIndex(
                        movement => movement.inventoryId === logisticsItems[0].inventoryId
                    );

                    if (movementIndex !== -1) {
                        logisticsItem.lastMovements[movementIndex].quantity -= initItem.unit;

                        // 수량이 0 이하가 되면 해당 움직임 제거
                        if (logisticsItem.lastMovements[movementIndex].quantity <= 0) {
                            logisticsItem.lastMovements.splice(movementIndex, 1);
                        }
                    }

                    logisticsItem.updateState();
                    logistics[initItem.uid] = logisticsItem.toFirestore();
                }
            });
        }

        // 새로운 물류기기 정보 추가 또는 업데이트
        logisticsItems.forEach((item) => {
            const { logisticsItemId, logisticsItemName, quantity, movementType, newMovementId, inventoryId } = item;

            let logisticsItem = logistics[logisticsItemId]
                ? LogisticsItem.fromFirestore(logistics[logisticsItemId])
                : new LogisticsItem({ name: logisticsItemName });

            // 기존 inventoryId와 관련된 움직임 찾기
            const existingMovementIndex = logisticsItem.lastMovements.findIndex(
                movement => movement.inventoryId === inventoryId
            );

            if (existingMovementIndex !== -1) {
                // 기존 움직임 업데이트
                logisticsItem.lastMovements[existingMovementIndex] = {
                    movementId: newMovementId,
                    state: movementType,
                    quantity: Number(quantity),
                    date: new Date(),
                    inventoryId,
                };
            } else {
                // 새로운 움직임 추가
                logisticsItem.addMovement({
                    movementId: newMovementId,
                    state: movementType,
                    quantity: Number(quantity),
                    date: new Date(),
                    inventoryId,
                });
            }

            logisticsItem.updateState();
            logistics[logisticsItemId] = logisticsItem.toFirestore();
            console.log(`Logistics item ${logisticsItemId} has been updated. New quantity: ${quantity}`);
        });

        console.log('Final logistics:', logistics);

        transaction.update(warehouseRef, {
            logistics: logistics,
            lastUpdated: serverTimestamp(),
        });
    });
};
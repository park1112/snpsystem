import { db } from './firebase';
import { runTransaction, doc } from 'firebase/firestore';

/**
 * 창고 코드와 창고 UID를 기반으로 고유한 아이템 코드를 생성합니다.
 * @param {string} warehouseCode - 창고 코드
 * @param {string} warehouseUid - 창고의 Firebase UID
 * @returns {Promise<string>} 생성된 고유 아이템 코드
 * @throws {Error} 코드 생성 실패 시 에러를 throw합니다.
 */
const generateUniqueItemCode = async (warehouseCode, warehouseUid) => {
    if (!warehouseCode || typeof warehouseCode !== 'string') {
        throw new Error('Invalid warehouse code');
    }
    if (!warehouseUid || typeof warehouseUid !== 'string') {
        throw new Error('Invalid warehouse UID');
    }

    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const result = await runTransaction(db, async (transaction) => {
                const warehouseDocRef = doc(db, 'warehouses', warehouseUid);
                const warehouseDoc = await transaction.get(warehouseDocRef);

                if (!warehouseDoc.exists()) {
                    throw new Error('Warehouse document does not exist!');
                }

                const warehouseData = warehouseDoc.data();

                // 오늘 날짜 구하기
                const today = new Date();
                const dateString = today.toISOString().slice(2, 10).replace(/-/g, ""); // 'YYMMDD' 형식

                // 마지막으로 아이템을 생성한 날짜 확인
                const lastItemDate = warehouseData.lastItemDate || '';

                // 새로운 날짜라면 카운트 리셋
                let todayItemCount = (lastItemDate === dateString) ? (warehouseData.todayItemCount || 0) : 0;

                // 카운트 증가
                todayItemCount++;

                // 창고 문서 업데이트
                transaction.update(warehouseDocRef, {
                    lastItemDate: dateString,
                    todayItemCount: todayItemCount
                });

                // 새로운 고유 코드 생성
                const uniqueId = todayItemCount.toString().padStart(4, '0');
                return `${warehouseCode}-${dateString}-${uniqueId}`;
            });

            return result;
        } catch (error) {
            console.error('Error in generateUniqueItemCode:', error);
            retries++;
            if (retries >= maxRetries) {
                throw new Error('Failed to generate unique item code after multiple attempts');
            }
            // 잠시 대기 후 재시도
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

export default generateUniqueItemCode;
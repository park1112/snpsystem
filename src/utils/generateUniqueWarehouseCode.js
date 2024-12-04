import { db } from './firebase';
import { collection, getDocs, runTransaction, doc, query, orderBy, limit } from 'firebase/firestore';

async function generateUniqueWarehouseCode() {
    const warehousesRef = collection(db, 'warehouses');

    try {
        return await runTransaction(db, async (transaction) => {
            // Get the warehouse with the highest code
            const q = query(warehousesRef, orderBy('warehouseCode', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);

            let highestCode = 0;
            if (!querySnapshot.empty) {
                const highestWarehouse = querySnapshot.docs[0].data();
                highestCode = parseInt(highestWarehouse.warehouseCode, 10);
            }

            // Generate the new code
            const newCode = (highestCode + 1).toString().padStart(3, '0');

            console.log('Generated new warehouse code:', newCode); // 로그 추가

            // Check if the new code already exists (just in case)
            const newCodeRef = doc(warehousesRef, newCode);
            const newCodeDoc = await transaction.get(newCodeRef);

            if (newCodeDoc.exists()) {
                throw new Error('Generated code already exists. Please try again.');
            }

            return newCode;
        });
    } catch (error) {
        console.error('Error generating warehouse code:', error);
        throw error;
    }
}

export default generateUniqueWarehouseCode;
// src/hooks/useSubmitInventory.js
import { useCallback } from 'react';
import { doc, runTransaction, collection } from 'firebase/firestore';
import { db } from '../utils/firebase';

const useSubmitInventory = (onSuccess, onError) => {
  const submitInventory = useCallback(
    async (formData) => {
      try {
        await runTransaction(db, async (transaction) => {
          const newDocRef = doc(collection(db, 'inventory'));
          transaction.set(newDocRef, formData);

          const warehouseRef = doc(db, 'warehouses', formData.warehouseUid);
          const warehouseDoc = await transaction.get(warehouseRef);

          if (!warehouseDoc.exists()) {
            throw new Error('Warehouse does not exist');
          }

          const warehouseData = warehouseDoc.data();
          const statusData = warehouseData.statuses[formData.status] || { products: {} };

          if (!statusData.products[formData.productUid]) {
            statusData.products[formData.productUid] = {
              count: parseInt(formData.quantity),
              inventoryUids: [newDocRef.id],
            };
          } else {
            statusData.products[formData.productUid].count += parseInt(formData.quantity);
            statusData.products[formData.productUid].inventoryUids.push(newDocRef.id);
          }

          transaction.update(warehouseRef, {
            [`statuses.${formData.status}.products`]: statusData.products,
          });
        });

        if (onSuccess) onSuccess();
      } catch (error) {
        if (onError) onError(error);
        console.error('Error adding inventory:', error);
      }
    },
    [onSuccess, onError]
  );

  return { submitInventory };
};

export default useSubmitInventory;

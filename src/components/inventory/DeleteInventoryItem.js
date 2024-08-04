import { useState } from 'react';
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { doc, runTransaction, deleteField } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const DeleteInventoryItem = ({ inventory, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = (e) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteInventory = async () => {
    try {
      await runTransaction(db, async (transaction) => {
        // 모든 읽기 작업을 먼저 수행
        const inventoryRef = doc(db, 'inventory', inventory.id);
        const warehouseRef = doc(db, 'warehouses', inventory.warehouseUid);

        const warehouseDoc = await transaction.get(warehouseRef);
        if (!warehouseDoc.exists()) {
          throw new Error('Warehouse document does not exist');
        }

        const warehouseData = warehouseDoc.data();

        // 이후 모든 쓰기 작업 수행
        transaction.delete(inventoryRef);

        if (warehouseData.statuses && warehouseData.statuses[inventory.status]) {
          const statusData = warehouseData.statuses[inventory.status];
          if (statusData.products && statusData.products[inventory.productUid]) {
            const productData = { ...statusData.products[inventory.productUid] };
            productData.count -= inventory.quantity;
            const index = productData.inventoryUids.indexOf(inventory.id);
            if (index > -1) {
              productData.inventoryUids.splice(index, 1);
            }
            if (productData.count <= 0) {
              transaction.update(warehouseRef, {
                [`statuses.${inventory.status}.products.${inventory.productUid}`]: deleteField(),
              });
            } else {
              transaction.update(warehouseRef, {
                [`statuses.${inventory.status}.products.${inventory.productUid}`]: productData,
              });
            }
          }
        }
      });

      onDelete(inventory.id);
      handleCloseDialog();
    } catch (error) {
      console.error('Error deleting inventory: ', error);
      alert(`Failed to delete inventory: ${error.message}`);
    }
  };

  return (
    <>
      <IconButton onClick={handleOpenDialog}>
        <Delete />
      </IconButton>
      <Dialog open={openDialog} onClose={handleCloseDialog} onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Delete Inventory</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this inventory item?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDeleteInventory} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteInventoryItem;

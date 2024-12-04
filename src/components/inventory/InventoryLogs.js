import { Box, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteInventoryTransaction } from '../../services/inventoryService';

const InventoryLogs = ({ logs, onDeleteSuccess }) => {

  const handleDelete = async (inventoryUid) => {
    if (!window.confirm("정말로 이 인벤토리와 관련된 모든 데이터를 삭제하시겠습니까?")) {
      return;
    }

    try {
      console.log("인벤토리 아이템 삭제 시작, inventoryUid:", inventoryUid);

      // 인벤토리 아이템 삭제
      await deleteInventoryTransaction(inventoryUid);

      console.log("인벤토리 아이템 삭제 완료");

      if (onDeleteSuccess) {
        onDeleteSuccess(inventoryUid);
      }

      alert('인벤토리와 물류기기 상태가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting inventory:', error);
    }
  };
  return (
    <Box>
      <Typography variant="h6">Recent Logs</Typography>
      <List>
        {logs.map((log, index) => (
          <ListItem key={index} secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(log.id)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText
              primary={`Warehouse: ${log.warehouseName}, Product: ${log.productName}, Quantity: ${log.quantity}`}
              secondary={`Logistics: ${log.logisticsName}, Logistics Quantity: ${log.logisticsQuantity
                }, Created At: ${new Date(log.createdAt).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default InventoryLogs;
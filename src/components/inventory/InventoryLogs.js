import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const InventoryLogs = ({ logs, onDelete, DeleteComponent }) => {
  return (
    <Box>
      <Typography variant="h6">Recent Logs</Typography>
      <List>
        {logs.map((log, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`Warehouse: ${log.warehouseName}, Product: ${log.productName}, Quantity: ${log.quantity}`}
              secondary={`Logistics: ${log.logisticsName}, Logistics Quantity: ${
                log.logisticsQuantity
              }, Created At: ${new Date(log.createdAt).toLocaleString()}`}
            />
            {DeleteComponent && <DeleteComponent inventory={log} onDelete={onDelete} />}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default InventoryLogs;

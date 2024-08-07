import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const InventorySelector = ({ products, onSelect }) => {
    const [selectedInventory, setSelectedInventory] = useState({});
    const [inventoryDetails, setInventoryDetails] = useState({});

    useEffect(() => {
        const fetchInventoryDetails = async () => {
            const details = {};
            for (const product of products) {
                for (const uid of product.inventoryUids) {
                    const docRef = doc(db, 'inventory', uid);
                    try {
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            details[uid] = docSnap.data().quantity;
                        }
                    } catch (error) {
                        console.error("Error fetching inventory details:", error);
                    }
                }
            }
            setInventoryDetails(details);
        };

        fetchInventoryDetails();
    }, [products]);

    const handleInventorySelect = (inventory) => {
        setSelectedInventory((prevSelected) => {
            const newSelected = { ...prevSelected };
            if (newSelected[inventory.uid]) {
                delete newSelected[inventory.uid];
                onSelect(inventory, -inventory.quantity);
            } else {
                newSelected[inventory.uid] = inventory;
                onSelect(inventory, inventory.quantity);
            }
            return newSelected;
        });
    };

    return (
        <Box>
            {products.map((product) => (
                <Box key={`${product.warehouseId}-${product.productId}`} mt={2}>
                    <Typography variant="h6">{product.productName}</Typography>
                    <Typography variant="body2">{`창고: ${product.warehouseName}, 상태: ${product.status}`}</Typography>
                    <Box sx={{ display: 'flex', overflowX: 'auto', mt: 1, py: 2 }}>
                        {product.inventoryUids.map((inventoryUid) => {
                            const isSelected = selectedInventory[inventoryUid];
                            const inventoryCount = inventoryDetails[inventoryUid] || 0;
                            return (
                                <Box
                                    key={inventoryUid}
                                    p={2}
                                    border={1}
                                    borderColor={isSelected ? 'primary.main' : 'grey.300'}
                                    borderRadius={1}
                                    bgcolor={isSelected ? 'primary.light' : 'transparent'}
                                    onClick={() =>
                                        handleInventorySelect({
                                            uid: inventoryUid,
                                            ...product,
                                            quantity: inventoryCount,
                                        })
                                    }
                                    sx={{
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        minWidth: 160,
                                        mr: 2,
                                        transition: 'transform 0.2s ease-in-out',
                                        transform: 'scale(1)',
                                    }}
                                >
                                    <Typography variant="body2">
                                        {product.productName}
                                    </Typography>
                                    <Typography variant="body2">
                                        수량: {inventoryCount}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default InventorySelector;
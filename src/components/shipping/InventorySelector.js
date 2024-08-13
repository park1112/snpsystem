import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { getKoreanStatus } from '../CommonStatus';

const InventorySelector = ({ products, onSelect }) => {
    const [selectedInventory, setSelectedInventory] = useState({});
    const [inventoryDetails, setInventoryDetails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventoryDetails = async () => {
            const details = [];
            const promises = products.flatMap(product =>
                product.inventoryUids.map(async uid => {
                    const docRef = doc(db, 'inventories', uid);
                    try {
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            details.push({
                                uid,
                                ...docSnap.data(),
                                productName: product.productName,
                                warehouseName: product.warehouseName,
                                status: product.status
                            });
                        }
                    } catch (error) {
                        console.error("Error fetching inventory details:", error);
                    }
                })
            );

            await Promise.all(promises);
            setInventoryDetails(details);
            setLoading(false);
        };

        fetchInventoryDetails();
    }, [products]);

    // const handleInventorySelect = (inventory) => {
    //     setSelectedInventory(prevSelected => {
    //         const newSelected = { ...prevSelected };
    //         if (newSelected[inventory.uid]) {
    //             delete newSelected[inventory.uid];
    //             onSelect(inventory, -inventory.quantity);
    //         } else {
    //             newSelected[inventory.uid] = inventory;
    //             onSelect(inventory, inventory.quantity);
    //         }
    //         return newSelected;
    //     });
    // };

    const handleInventorySelect = (inventory) => {
        setSelectedInventory(prevSelected => {
            const newSelected = { ...prevSelected };
            if (newSelected[inventory.uid]) {
                delete newSelected[inventory.uid];
                onSelect(inventory, -1); // 선택 해제 시 -1
            } else {
                newSelected[inventory.uid] = inventory;
                onSelect(inventory, 1); // 선택 시 1
            }
            return newSelected;
        });
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box>
            {inventoryDetails.map((inventory) => (
                <Box key={inventory.uid} mt={2}>
                    <Typography variant="h6">{inventory.productName}</Typography>
                    <Typography variant="body2">
                        {`창고: ${inventory.warehouseName}, 상태: ${getKoreanStatus(inventory.status) || '없음'}`}
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        overflowX: 'auto',
                        mt: 1,
                        py: 2,
                        '&::-webkit-scrollbar': {
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,.2)',
                            borderRadius: '4px',
                        },
                    }}>
                        <Box
                            p={2}
                            border={1}
                            borderColor={selectedInventory[inventory.uid] ? 'primary.main' : 'grey.300'}
                            borderRadius={1}
                            bgcolor={selectedInventory[inventory.uid] ? 'primary.light' : 'transparent'}
                            onClick={() => handleInventorySelect(inventory)}
                            sx={{
                                cursor: 'pointer',
                                textAlign: 'center',
                                width: '160px',
                                minWidth: '160px',
                                mr: 2,
                                transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.05)',

                                },
                            }}
                        >
                            {inventory.products.map((product, index) => (
                                <Box key={index} sx={{ mb: 1 }}>  {/* 각 제품 정보를 Box로 감싸고 key 추가 */}
                                    <Typography variant="body2">
                                        {product.productName}
                                    </Typography>
                                    <Typography variant="body2">
                                        수량: {product.quantity}
                                    </Typography>
                                </Box>
                            ))}

                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default InventorySelector;
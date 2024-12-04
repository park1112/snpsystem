import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Grid, Typography } from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useRouter } from 'next/router';
import ColorPickerModal from './storage/ColorPickerModal';
import ColorBox from './storage/ColorBox';

const pastelColors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'];

export default function WarehouseInventory() {
    const [rows, setRows] = useState(0);
    const [cols, setCols] = useState(0);
    const [grid, setGrid] = useState({});
    const [unitName, setUnitName] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedBox, setSelectedBox] = useState(null);
    const [remarks, setRemarks] = useState(Array(4).fill(''));
    const router = useRouter();
    const { warehouseId, subCollectionDocId } = router.query;

    useEffect(() => {
        const fetchWarehouseData = async () => {
            if (!warehouseId || !subCollectionDocId) {
                console.error("Invalid warehouseId or subCollectionDocId");
                return;
            }
            try {
                const docRef = doc(db, 'warehouses', warehouseId, 'storage_units', subCollectionDocId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const storageUnitData = docSnap.data();
                    setUnitName(storageUnitData.unitName || '');
                    setRows(storageUnitData.width || 0);
                    setCols(storageUnitData.height || 0);
                    setGrid(storageUnitData.grid || {});
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching storage unit data:", error);
            }
        };

        fetchWarehouseData();
    }, [warehouseId, subCollectionDocId]);

    const handleBoxClick = useCallback((rowIdx, colIdx) => {
        const cellData = grid[rowIdx]?.[colIdx];
        setSelectedBox({ row: rowIdx, col: colIdx });
        setRemarks(cellData?.remarks || Array(4).fill(''));
        setOpen(true);
    }, [grid]);

    const handleSaveColor = useCallback(async (updatedRemarks) => {
        if (selectedBox !== null) {
            setGrid(prevGrid => {
                const newGrid = { ...prevGrid };
                if (!newGrid[selectedBox.row]) {
                    newGrid[selectedBox.row] = {};
                }
                newGrid[selectedBox.row][selectedBox.col] = { remarks: updatedRemarks };
                return newGrid;
            });

            setOpen(false);

            try {
                const docRef = doc(db, 'warehouses', warehouseId, 'storage_units', subCollectionDocId);
                await updateDoc(docRef, { [`grid.${selectedBox.row}.${selectedBox.col}`]: { remarks: updatedRemarks } });
            } catch (error) {
                console.error("Error saving grid data:", error);
            }
        }
    }, [selectedBox, warehouseId, subCollectionDocId]);

    const handleCloseModal = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" align="center" gutterBottom>
                창고번호 : {unitName}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                <TextField
                    label="가로"
                    type="number"
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    disabled
                />
                <TextField
                    label="세로"
                    type="number"
                    value={cols}
                    onChange={(e) => setCols(Number(e.target.value))}
                    disabled
                />
            </Box>

            <Grid container spacing={2}>
                {Array.from({ length: rows }, (_, rowIdx) =>
                    Array.from({ length: cols }, (_, colIdx) => (
                        <Grid item xs={12 / cols} key={`${rowIdx}-${colIdx}`}>
                            <ColorBox
                                remarks={grid[rowIdx]?.[colIdx]?.remarks || []}
                                onClick={() => handleBoxClick(rowIdx, colIdx)}
                            />
                        </Grid>
                    ))
                )}
            </Grid>

            <ColorPickerModal
                open={open}
                onClose={handleCloseModal}
                onSave={handleSaveColor}
                remarks={remarks}
                setRemarks={setRemarks}
                warehouseUid={warehouseId}
                storageUnitId={subCollectionDocId}
                selectedBox={selectedBox}
            />
        </Box>
    );
}
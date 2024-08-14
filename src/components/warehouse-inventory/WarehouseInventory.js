import React, { useState } from 'react';
import { Box, TextField, Button, Grid, Modal, Typography } from '@mui/material';

const pastelColors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'];

function ColorBox({ colors, remarks, onClick }) {
    return (
        <Box
            sx={{
                height: 100,
                border: '1px solid #ccc',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
            onClick={onClick}
        >
            {colors.map((color, index) => (
                <Box
                    key={index}
                    sx={{
                        height: '25%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                            backgroundColor: pastelColors[index % pastelColors.length],
                        },
                    }}
                >
                    <Typography variant="caption" sx={{ color: '#000', fontWeight: 'bold' }}>
                        {remarks[index]}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

function ColorPickerModal({ open, onClose, selectedCell, onSelectCell, onSave, remarks, setRemarks }) {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    bgcolor: 'background.paper',
                    p: 4,
                    boxShadow: 24,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" mb={2}>
                    Choose Cell and Add Remark
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Box
                            key={index}
                            sx={{
                                height: 50,
                                backgroundColor: selectedCell === index ? pastelColors[index % pastelColors.length] : 'transparent',
                                border: '1px solid #ccc',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                    backgroundColor: pastelColors[index % pastelColors.length],
                                },
                            }}
                            onClick={() => onSelectCell(index)}
                        >
                            <TextField
                                label={`비고 ${index + 1}`}
                                variant="standard"
                                fullWidth
                                value={remarks[index]}
                                onChange={(e) => {
                                    const newRemarks = [...remarks];
                                    newRemarks[index] = e.target.value;
                                    setRemarks(newRemarks);
                                }}
                            />
                        </Box>
                    ))}
                </Box>

                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={onSave}
                    disabled={selectedCell === null}
                >
                    Save
                </Button>
            </Box>
        </Modal>
    );
}

export default function WarehouseInventory() {
    const [rows, setRows] = useState(0);
    const [cols, setCols] = useState(0);
    const [grid, setGrid] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedBox, setSelectedBox] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [remarks, setRemarks] = useState(Array(4).fill('')); // 4개의 비고 텍스트 필드 상태

    const handleGenerateGrid = () => {
        const newGrid = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({
                colors: Array(4).fill('transparent'), // 초기 색상
                remarks: Array(4).fill(''), // 비고 필드 초기화
            }))
        );
        setGrid(newGrid);
    };

    const handleBoxClick = (rowIdx, colIdx) => {
        setSelectedBox({ row: rowIdx, col: colIdx });
        setRemarks(grid[rowIdx][colIdx].remarks || Array(4).fill(''));
        setOpen(true);
    };

    const handleCellClick = (index) => {
        setSelectedCell(index);
    };

    const handleSaveColor = () => {
        if (selectedBox !== null && selectedCell !== null) {
            const newGrid = [...grid];
            const colorIndex = selectedCell % pastelColors.length; // 파스텔 색상을 순환
            newGrid[selectedBox.row][selectedBox.col].colors[selectedCell] = pastelColors[colorIndex];
            newGrid[selectedBox.row][selectedBox.col].remarks = remarks;
            setGrid(newGrid);
            setOpen(false);
            setSelectedCell(null); // 선택된 셀 초기화
            setRemarks(Array(4).fill('')); // 비고 필드 초기화
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    label="Rows"
                    type="number"
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                />
                <TextField
                    label="Columns"
                    type="number"
                    value={cols}
                    onChange={(e) => setCols(Number(e.target.value))}
                />
                <Button variant="contained" onClick={handleGenerateGrid}>
                    Generate Grid
                </Button>
            </Box>

            <Grid container spacing={2}>
                {grid.map((row, rowIdx) =>
                    row.map((box, colIdx) => (
                        <Grid item xs={12 / cols} key={`${rowIdx}-${colIdx}`}>
                            <ColorBox
                                colors={box.colors}
                                remarks={box.remarks}
                                onClick={() => handleBoxClick(rowIdx, colIdx)}
                            />
                        </Grid>
                    ))
                )}
            </Grid>

            <ColorPickerModal
                open={open}
                onClose={() => setOpen(false)}
                selectedCell={selectedCell}
                onSelectCell={handleCellClick}
                onSave={handleSaveColor}
                remarks={remarks}
                setRemarks={setRemarks}
            />
        </Box>
    );
}

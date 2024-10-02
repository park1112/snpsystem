import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';

const pastelColors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'];

function ColorPickerModal({ open, onClose, onSave, remarks, setRemarks, warehouseUid, storageUnitId, selectedBox }) {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const fetchDocuments = async () => {
            if (!warehouseUid) return;

            try {
                const querySnapshot = await getDocs(collection(db, 'warehouse_inventory'));
                const docs = querySnapshot.docs
                    .filter(doc => doc.data().warehouseUid === warehouseUid)
                    .map(doc => ({ id: doc.id, ...doc.data() }));
                setDocuments(docs);
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };

        fetchDocuments();
    }, [warehouseUid]);

    const handleDocumentClick = (docId) => {
        setRemarks(prevRemarks => {
            const newRemarks = [...prevRemarks];
            const index = newRemarks.indexOf(docId);

            if (index !== -1) {
                // 이미 선택된 문서라면 제거
                newRemarks[index] = '';
            } else {
                // 새로운 문서 추가
                const emptyIndex = newRemarks.indexOf('');
                if (emptyIndex !== -1) {
                    newRemarks[emptyIndex] = docId;
                } else if (newRemarks.length < 4) {
                    newRemarks.unshift(docId);
                }
            }

            // 빈 문자열을 배열의 앞쪽으로 이동
            return [...newRemarks.filter(r => r === ''), ...newRemarks.filter(r => r !== '')].slice(0, 4);
        });
    };

    const handleRemoveRemark = (index) => {
        setRemarks(prevRemarks => {
            const newRemarks = [...prevRemarks];
            newRemarks[index] = '';

            // 빈 문자열을 배열의 앞쪽으로 이동
            return [...newRemarks.filter(r => r === ''), ...newRemarks.filter(r => r !== '')].slice(0, 4);
        });
    };

    const getRemarkColor = (docId) => {
        const index = remarks.indexOf(docId);
        return index !== -1 ? pastelColors[index % pastelColors.length] : 'transparent';
    };


    const handleSave = async () => {
        if (!selectedBox || remarks.filter(Boolean).length === 0) {
            console.log('Save aborted: either selectedBox is null or no remarks are provided.');
            return;
        }

        try {
            console.log('Starting save process...');

            const docRef = doc(db, 'warehouses', warehouseUid, 'storage_units', storageUnitId);
            console.log('Document reference created:', docRef.path);

            const docSnap = await getDoc(docRef);
            console.log('Document snapshot retrieved:', docSnap.exists());

            if (docSnap.exists()) {
                const storageUnitData = docSnap.data();
                console.log('Storage unit data:', storageUnitData);

                let grid = storageUnitData.grid || {};
                console.log('Current grid:', grid);

                // Ensure the row exists
                if (!grid[selectedBox.row]) {
                    grid[selectedBox.row] = {};
                }

                // Filter out undefined values and ensure the data structure is valid
                const updatedCell = {

                    remarks: remarks.filter(Boolean)
                };

                console.log('Updated cell data:', updatedCell);

                // Update the specific cell in the grid
                grid[selectedBox.row][selectedBox.col] = updatedCell;
                console.log(`Updated grid at position [${selectedBox.row}][${selectedBox.col}]:`, grid[selectedBox.row][selectedBox.col]);

                // Remove any undefined values from the grid
                Object.keys(grid).forEach(row => {
                    Object.keys(grid[row]).forEach(col => {
                        if (grid[row][col] === undefined) {
                            delete grid[row][col];
                        }
                    });
                    if (Object.keys(grid[row]).length === 0) {
                        delete grid[row];
                    }
                });

                console.log('Final grid structure:', grid);

                // Firestore에 업데이트
                await updateDoc(docRef, { grid });
                console.log('Grid data successfully updated in Firestore.');
                onSave(remarks);
                onClose(); // 다이얼로그 닫기
            }
        } catch (error) {
            console.error('Error saving data:', error);
            console.error('Error details:', error.code, error.message);
            // 추가 디버깅 정보
            console.log('Selected Box:', selectedBox);
            console.log('Remarks:', remarks);
        }
    };





    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    p: 4,
                    boxShadow: 24,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h5" mb={2}>
                    인벤토리 창고 재고
                </Typography>
                <Box sx={{ mt: 4 }}>
                    {remarks.map((remark, index) => (
                        <Box
                            key={index}
                            sx={{
                                height: 50,
                                backgroundColor: remark ? pastelColors[index % pastelColors.length] : 'transparent',
                                border: '1px solid #ccc',
                                marginBottom: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: remark ? 'pointer' : 'default',
                                '&:hover': {
                                    backgroundColor: remark ? pastelColors[index % pastelColors.length] : 'transparent',
                                },
                            }}
                            onClick={() => remark && handleRemoveRemark(index)}

                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#000',
                                    fontWeight: 'bold',
                                    wordWrap: 'break-word',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textAlign: 'center',
                                }}
                            >
                                {remark}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 2, mb: 2, mt: 4 }}>
                    {documents.map((doc) => (
                        <Box
                            key={doc.id}
                            sx={{
                                width: 100,
                                height: 100,
                                backgroundColor: getRemarkColor(doc.id),
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                cursor: remarks.filter(Boolean).length < 4 || remarks.includes(doc.id) ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                '&:hover': {
                                    backgroundColor: remarks.filter(Boolean).length < 4 || remarks.includes(doc.id) ? pastelColors[(3 - remarks.filter(Boolean).length) % pastelColors.length] : 'transparent',
                                },
                            }}
                            onClick={() => handleDocumentClick(doc.id)}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#000',
                                    wordWrap: 'break-word',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {doc.id}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleSave}  // 저장 로직 호출
                    disabled={!remarks.some((remark) => remark)}
                >
                    Save
                </Button>
            </Box>
        </Modal>
    );
}

export default ColorPickerModal;

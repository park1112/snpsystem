import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Grid, Paper, CircularProgress, Snackbar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
    Select, MenuItem, FormControl, InputLabel, Checkbox, FormGroup, FormControlLabel,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import * as XLSX from 'xlsx';
import { collection, addDoc, getDocs, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Iconify from '../Iconify';




const BulkDataUploadPage = () => {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState('');
    const [fields, setFields] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [uploadedData, setUploadedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [openCollectionDialog, setOpenCollectionDialog] = useState(false);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const collectionsDoc = await getDoc(doc(db, 'system', 'collections'));
            if (collectionsDoc.exists()) {
                setCollections(collectionsDoc.data().list || []);
            } else {
                console.log("No collections document!");
                setSnackbar({ open: true, message: '사용 가능한 컬렉션 목록을 찾을 수 없습니다.' });
            }
        } catch (error) {
            console.error("Error fetching collections:", error);
            setSnackbar({ open: true, message: '컬렉션 정보를 불러오는 데 실패했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCollectionChange = async (event) => {
        const collectionName = event.target.value;
        setSelectedCollection(collectionName);
        setSelectedFields([]);
        setUploadedData([]);

        if (collectionName) {
            setLoading(true);
            try {
                const sampleDoc = await getDocs(collection(db, collectionName));
                if (!sampleDoc.empty) {
                    const sampleData = sampleDoc.docs[0].data();
                    setFields(Object.keys(sampleData));
                } else {
                    setFields([]);
                    setSnackbar({ open: true, message: '선택한 컬렉션에 문서가 없습니다.' });
                }
            } catch (error) {
                console.error("Error fetching fields:", error);
                setSnackbar({ open: true, message: '필드 정보를 불러오는 데 실패했습니다.' });
            } finally {
                setLoading(false);
            }
        }
    };


    const handleFieldToggle = (field) => {
        setSelectedFields(prev =>
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
    };

    const downloadTemplate = () => {
        const template = [
            Object.fromEntries(selectedFields.map(field => [field, '']))
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, `${selectedCollection}_template.xlsx`);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const bstr = event.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            setUploadedData(data);
        };
        reader.readAsBinaryString(file);
    };

    const handleBulkUpload = async () => {
        setLoading(true);
        try {
            for (const item of uploadedData) {
                let itemData = { ...item, createdAt: new Date() };

                // Remove any undefined or empty fields before uploading
                Object.keys(itemData).forEach(key => {
                    if (itemData[key] === undefined || itemData[key] === '') {
                        delete itemData[key];
                    }
                });

                const docRef = await addDoc(collection(db, selectedCollection), itemData);

                // Update the document with its own UID
                await updateDoc(docRef, { UID: docRef.id });
            }
            setSnackbar({ open: true, message: '데이터가 성공적으로 등록되었습니다.' });
            setUploadedData([]);  // 성공적으로 업로드된 후, 목록 초기화
        } catch (error) {
            console.error("Error adding documents: ", error);
            setSnackbar({ open: true, message: '데이터 등록 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };


    const CollectionRegistrationDialog = ({ open, onClose, onRegister, existingCollections }) => {
        const [newCollection, setNewCollection] = useState('');

        const handleRegister = () => {
            if (newCollection && !existingCollections.includes(newCollection)) {
                onRegister(newCollection);
                setNewCollection('');
            }
        };

        return (
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>새 컬렉션 등록</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="컬렉션 이름"
                        fullWidth
                        value={newCollection}
                        onChange={(e) => setNewCollection(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>취소</Button>
                    <Button onClick={handleRegister} color="primary">
                        등록
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    const handleRegisterCollection = async (newCollection) => {
        setLoading(true);
        try {
            const collectionsRef = doc(db, 'system', 'collections');
            const collectionsDoc = await getDoc(collectionsRef);

            let updatedCollections;
            if (collectionsDoc.exists()) {
                updatedCollections = [...collectionsDoc.data().list, newCollection];
            } else {
                updatedCollections = [newCollection];
            }

            await setDoc(collectionsRef, { list: updatedCollections });

            setCollections(updatedCollections);
            setSnackbar({ open: true, message: '새 컬렉션이 등록되었습니다.' });
        } catch (error) {
            console.error("Error registering new collection:", error);
            setSnackbar({ open: true, message: '컬렉션 등록 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
            handleCloseCollectionDialog();
        }
    };


    const handleOpenCollectionDialog = () => {
        console.log("Opening collection dialog");  // 로깅 추가
        setOpenCollectionDialog(true);
    };

    const handleCloseCollectionDialog = () => {
        setOpenCollectionDialog(false);
    };





    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                데이터 대량 등록
            </Typography>
            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleOpenCollectionDialog}
                            startIcon={<Iconify icon="ic:round-add" />}
                            style={{ marginBottom: '10px' }}
                        >
                            새 컬렉션 등록
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>컬렉션 선택</InputLabel>
                            <Select
                                value={selectedCollection}
                                onChange={handleCollectionChange}
                            >
                                {collections.map((collection) => (
                                    <MenuItem key={collection} value={collection}>{collection}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    {selectedCollection && (
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>필드 선택</Typography>
                            <FormGroup>
                                {fields.map((field) => (
                                    <FormControlLabel
                                        key={field}
                                        control={
                                            <Checkbox
                                                checked={selectedFields.includes(field)}
                                                onChange={() => handleFieldToggle(field)}
                                            />
                                        }
                                        label={field}
                                    />
                                ))}
                            </FormGroup>
                        </Grid>
                    )}
                    {selectedFields.length > 0 && (
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={downloadTemplate}
                                startIcon={<Iconify icon="ic:round-download" />}
                            >
                                템플릿 다운로드
                            </Button>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <input
                            accept=".xlsx, .xls"
                            style={{ display: 'none' }}
                            id="raised-button-file"
                            type="file"
                            onChange={handleFileUpload}
                        />
                        <label htmlFor="raised-button-file">
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<Iconify icon="ic:round-upload" />}
                            >
                                엑셀 업로드
                            </Button>
                        </label>
                    </Grid>
                    {uploadedData.length > 0 && (
                        <>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleBulkUpload}
                                    startIcon={<Iconify icon="ic:round-cloud-upload" />}
                                >
                                    대량 등록
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                {selectedFields.map((field) => (
                                                    <TableCell key={field}>{field}</TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {uploadedData.map((item, index) => (
                                                <TableRow key={index}>
                                                    {selectedFields.map((field) => (
                                                        <TableCell key={field}>{item[field]}</TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Paper>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
            <CollectionRegistrationDialog
                open={openCollectionDialog}
                onClose={handleCloseCollectionDialog}
                onRegister={handleRegisterCollection}
                existingCollections={collections}
            />
        </Container>
    );


};

export default BulkDataUploadPage;
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    TextField,
    Button,
    Box,
    Typography,
    Modal,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const SearchAndAddComponent = ({ collectionName, searchField, FormComponent, searchCondition, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            let q;
            if (searchCondition) {
                q = query(
                    collection(db, collectionName),
                    where(searchField, searchCondition, searchTerm)
                );
            } else {
                q = query(
                    collection(db, collectionName),
                    where(searchField, '>=', searchTerm),
                    where(searchField, '<=', searchTerm + '\uf8ff')
                );
            }
            const querySnapshot = await getDocs(q);
            const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNew = () => {
        setIsModalOpen(true);
    };
    const handleRowClick = (item) => {
        console.log("Row clicked:", item);  // 디버깅용 로그 추가
        if (onSelect && typeof onSelect === 'function') {
            onSelect(item);
        } else {
            console.error("onSelect is not a function or is undefined");
        }
    };
    // 테이블 헤더를 동적으로 생성
    const getTableHeaders = () => {
        if (searchResults.length === 0) return [];
        return Object.keys(searchResults[0]).filter(key => key !== 'id');
    };

    // 셀 데이터를 적절한 형식으로 변환
    const formatCellData = (data) => {
        if (data === null || data === undefined) {
            return 'N/A';
        }
        if (data instanceof Date) {
            return data.toLocaleString();
        }
        if (typeof data === 'object' && data !== null && Object.prototype.hasOwnProperty.call(data, 'seconds')) {
            // Firestore Timestamp
            return new Date(data.seconds * 1000).toLocaleString();
        }
        if (typeof data === 'object') {
            return JSON.stringify(data);
        }
        return String(data);
    };

    return (
        <Box>
            <Box mb={2}>
                <Autocomplete
                    freeSolo
                    options={searchResults.map((option) => option[searchField])}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="검색"
                            variant="outlined"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    )}
                    onInputChange={(event, newInputValue) => {
                        setSearchTerm(newInputValue);
                    }}
                    loading={isLoading}
                    loadingText="검색 중..."
                />
            </Box>

            {searchResults.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {getTableHeaders().map((header) => (
                                    <TableCell key={header}>{header}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {searchResults.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => handleRowClick(row)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {getTableHeaders().map((header) => (
                                        <TableCell key={header}>
                                            {formatCellData(row[header])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                searchTerm && (
                    <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>데이터가 없습니다. 추가하세요.</Typography>
                        <Button variant="contained" color="secondary" onClick={handleAddNew}>
                            새로 추가
                        </Button>
                    </Box>
                )
            )}

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="modal-title" variant="h6" component="h2" mb={2}>
                        새 항목 추가
                    </Typography>
                    <FormComponent />
                </Box>
            </Modal>
        </Box>
    );
};
SearchAndAddComponent.propTypes = {
    collectionName: PropTypes.string.isRequired,
    searchField: PropTypes.string.isRequired,
    FormComponent: PropTypes.elementType.isRequired,
    searchCondition: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]),
    onSelect: PropTypes.func,
};

export default SearchAndAddComponent;
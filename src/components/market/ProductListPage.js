import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc, query, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import {
    Box,
    Button,
    Typography,
    TextField,
    TableContainer,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Pagination,
    CircularProgress,
    InputAdornment,
    Chip,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress
} from '@mui/material';
import { Search, Add, Download, Upload, Description } from '@mui/icons-material';
import dynamic from 'next/dynamic';
import * as XLSX from 'xlsx';

const SortableTableHeader = dynamic(() => import('../SortableTableHeader'), { ssr: false });

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markets, setMarkets] = useState([]);
    const [openMarkets, setOpenMarkets] = useState({});
    const router = useRouter();

    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('createdAt');
    const [orderDirection, setOrderDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isClient, setIsClient] = useState(false);
    const itemsPerPage = 20;

    // Bulk upload state
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadedProducts, setUploadedProducts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
        const savedState = JSON.parse(localStorage.getItem('genericList_product-list'));
        if (savedState) {
            setSearchTerm(savedState.searchTerm || '');
            setOrderBy(savedState.orderBy || 'createdAt');
            setOrderDirection(savedState.orderDirection || 'desc');
            setCurrentPage(savedState.currentPage || 1);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('genericList_product-list', JSON.stringify({
                searchTerm, orderBy, orderDirection, currentPage
            }));
        }
    }, [isClient, searchTerm, orderBy, orderDirection, currentPage]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'market_products'));
            const querySnapshot = await getDocs(q);
            const productsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
                updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : null,
            }));
            const sortedProductsData = productsData.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt.getTime() - a.createdAt.getTime();
            });
            setProducts(sortedProductsData);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMarkets = useCallback(async () => {
        try {
            const [marketsSnapshot, openMarketsSnapshot] = await Promise.all([
                getDocs(collection(db, 'markets')),
                getDocs(collection(db, 'open_market'))
            ]);

            const marketsData = marketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            marketsData.sort((a, b) => a.code - b.code);
            setMarkets(marketsData);

            const openMarketsData = {};
            openMarketsSnapshot.docs.forEach(doc => {
                openMarketsData[doc.id] = { name: doc.data().name, tex: doc.data().tex };
            });
            setOpenMarkets(openMarketsData);
        } catch (error) {
            console.error("Error fetching markets:", error);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchMarkets();
    }, [fetchProducts, fetchMarkets]);

    const handleRowClick = useCallback((id) => {
        router.push(`/market/product-detail/${id}`);
    }, [router]);

    const formatDate = useCallback((date) => {
        if (!date) return '-';
        const d = new Date(date);
        const now = new Date();
        const isToday = d.getFullYear() === now.getFullYear() &&
                        d.getMonth() === now.getMonth() &&
                        d.getDate() === now.getDate();
        if (isToday) {
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
        return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    const columns = useMemo(() => [
        { id: 'registeredProductName', label: '상품명' },
        { id: 'deliveryProductName', label: '택배 상품명' },
        { id: 'productPrice', label: '가격', render: (item) => item.productPrice?.toLocaleString() || 0 },
        { id: 'boxType', label: '박스' },
        { id: 'count', label: '수량', render: (item) => item.count || 0 },
        { id: 'margin', label: '마진', render: (item) => item.margin?.toLocaleString() || 0 },
        { id: 'createdAt', label: '등록', render: (item) => formatDate(item.createdAt) },
    ], [formatDate]);

    // Template Download
    const handleDownloadTemplate = useCallback(() => {
        const template = [{
            '오픈마켓 이름': '',
            '등록된 상품명': '',
            '택배 상품명': '',
            '기본수량': '',
            '상품 가격': '',
            '박스타입': '',
            '가격': '',
            '마진': '',
            ...Object.fromEntries(markets.map(market => [`${market.name} 옵션ID 1`, '']))
        }];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "product_template.xlsx");
        setSnackbar({ open: true, message: '템플릿이 다운로드되었습니다.', severity: 'success' });
    }, [markets]);

    // Download All Products
    const handleDownloadAll = useCallback(() => {
        if (products.length === 0) {
            setSnackbar({ open: true, message: '다운로드할 상품이 없습니다.', severity: 'warning' });
            return;
        }

        // 마켓별 옵션 컬럼 생성을 위한 최대 옵션 수 계산
        const maxOptionsPerMarket = {};
        markets.forEach(market => {
            maxOptionsPerMarket[market.id] = 0;
        });
        products.forEach(product => {
            if (product.marketOptions) {
                Object.entries(product.marketOptions).forEach(([marketId, options]) => {
                    if (options && options.length > maxOptionsPerMarket[marketId]) {
                        maxOptionsPerMarket[marketId] = options.length;
                    }
                });
            }
        });

        const exportData = products.map(product => {
            const baseData = {
                '오픈마켓 이름': openMarkets[product.selectedMarket]?.name || '',
                '등록된 상품명': product.registeredProductName || '',
                '택배 상품명': product.deliveryProductName || '',
                '기본수량': product.count || '',
                '상품 가격': product.productPrice || '',
                '박스타입': product.boxType || '',
                '가격': product.price || '',
                '마진': product.margin || '',
            };

            // 각 마켓별 옵션ID 추가
            markets.forEach(market => {
                const options = product.marketOptions?.[market.id] || [];
                const maxOptions = maxOptionsPerMarket[market.id] || 1;
                for (let i = 0; i < maxOptions; i++) {
                    baseData[`${market.name} 옵션ID ${i + 1}`] = options[i]?.optionId || '';
                    if (options[i]?.price) {
                        baseData[`${market.name} 옵션가격 ${i + 1}`] = options[i]?.price || '';
                    }
                }
            });

            baseData['등록일'] = product.createdAt ? product.createdAt.toLocaleDateString() : '';
            baseData['수정일'] = product.updatedAt ? product.updatedAt.toLocaleDateString() : '';

            return baseData;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);

        // 컬럼 너비 자동 조정
        const colWidths = Object.keys(exportData[0] || {}).map(key => ({
            wch: Math.max(key.length * 2, 10)
        }));
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
        setSnackbar({ open: true, message: `${products.length}개 상품이 다운로드되었습니다.`, severity: 'success' });
    }, [products, openMarkets, markets]);

    // Excel Upload Handler
    const handleFileUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const newProducts = data.map((item) => {
                    const selectedMarket = Object.keys(openMarkets).find(
                        (marketId) => openMarkets[marketId].name === item['오픈마켓 이름']
                    );
                    const marketOptions = markets.reduce((acc, market) => {
                        acc[market.id] = [];
                        let optionIndex = 1;
                        while (item[`${market.name} 옵션ID ${optionIndex}`]) {
                            acc[market.id].push({ optionId: item[`${market.name} 옵션ID ${optionIndex}`] });
                            optionIndex++;
                        }
                        return acc;
                    }, {});
                    return {
                        registeredProductName: item['등록된 상품명'],
                        deliveryProductName: item['택배 상품명'],
                        count: item['기본수량'],
                        productPrice: item['상품 가격'],
                        boxType: item['박스타입'],
                        price: item['가격'],
                        margin: item['마진'],
                        selectedMarket,
                        marketOptions,
                    };
                });
                setUploadedProducts(newProducts);
                setUploadDialogOpen(true);
            } catch (error) {
                console.error("Error processing Excel:", error);
                setSnackbar({ open: true, message: '엑셀 파일 처리 중 오류가 발생했습니다.', severity: 'error' });
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    }, [openMarkets, markets]);

    // Bulk Upload to Firestore
    const handleBulkUpload = useCallback(async () => {
        setUploading(true);
        try {
            for (const product of uploadedProducts) {
                let productData = { ...product, createdAt: new Date() };
                Object.keys(productData).forEach(key => {
                    if (productData[key] === undefined || productData[key] === '') {
                        delete productData[key];
                    }
                });
                const docRef = await addDoc(collection(db, 'market_products'), productData);
                await updateDoc(docRef, { UID: docRef.id });
            }
            setSnackbar({ open: true, message: `${uploadedProducts.length}개 상품이 등록되었습니다.`, severity: 'success' });
            setUploadedProducts([]);
            setUploadDialogOpen(false);
            fetchProducts();
        } catch (error) {
            console.error("Error uploading:", error);
            setSnackbar({ open: true, message: '상품 등록 중 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setUploading(false);
        }
    }, [uploadedProducts, fetchProducts]);

    // Filtering & Sorting
    const filteredItems = useMemo(() =>
        products.filter((item) =>
            columns.some((column) => {
                const value = column.render ? column.render(item) : item[column.id];
                return String(value).toLowerCase().includes(searchTerm.toLowerCase());
            })
        ), [products, columns, searchTerm]);

    const sortedItems = useMemo(() =>
        [...filteredItems].sort((a, b) => {
            const aValue = a[orderBy] || '';
            const bValue = b[orderBy] || '';
            if (aValue < bValue) return orderDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return orderDirection === 'asc' ? 1 : -1;
            return 0;
        }), [filteredItems, orderBy, orderDirection]);

    const paginatedItems = useMemo(() =>
        sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [sortedItems, currentPage]);

    useEffect(() => {
        if (isClient && filteredItems.length > 0) {
            const maxPage = Math.ceil(filteredItems.length / itemsPerPage);
            if (currentPage > maxPage) setCurrentPage(Math.max(1, maxPage));
        }
    }, [isClient, filteredItems.length, currentPage]);

    const handleSort = useCallback((property, direction) => {
        setOrderBy(property);
        setOrderDirection(direction);
    }, []);

    if (!isClient) return null;

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px"
                sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', borderRadius: 3 }}>
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#374151' }}>
                        상품 리스트
                    </Typography>
                    <Chip label={`${filteredItems.length}개`} size="small" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 600 }} />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="outlined" size="small" startIcon={<Description />} onClick={handleDownloadTemplate}
                        sx={{ borderColor: '#667eea', color: '#667eea', '&:hover': { borderColor: '#5a6fd6', backgroundColor: 'rgba(102,126,234,0.04)' } }}>
                        템플릿
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<Download />} onClick={handleDownloadAll}
                        sx={{ borderColor: '#10b981', color: '#10b981', '&:hover': { borderColor: '#059669', backgroundColor: 'rgba(16,185,129,0.04)' } }}>
                        전체 다운로드
                    </Button>
                    <input type="file" accept=".xlsx,.xls" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                    <Button variant="outlined" size="small" startIcon={<Upload />} onClick={() => fileInputRef.current?.click()}
                        sx={{ borderColor: '#f59e0b', color: '#f59e0b', '&:hover': { borderColor: '#d97706', backgroundColor: 'rgba(245,158,11,0.04)' } }}>
                        대량 등록
                    </Button>
                    <Button variant="contained" size="small" startIcon={<Add />} onClick={() => router.push('/market/market-product-create')}
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)' } }}>
                        상품추가
                    </Button>
                </Box>
            </Box>

            {/* Search */}
            <TextField placeholder="검색어를 입력하세요..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9ca3af' }} /></InputAdornment> }}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#f8fafc', '&:hover': { backgroundColor: '#f1f5f9' }, '&.Mui-focused': { backgroundColor: 'white', boxShadow: '0 0 0 3px rgba(102,126,234,0.1)' }, '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#cbd5e1' }, '&.Mui-focused fieldset': { borderColor: '#667eea' } } }} />

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', mb: 3 }}>
                <Table size="small">
                    {isClient && <SortableTableHeader columns={columns} orderBy={orderBy} orderDirection={orderDirection} onSort={handleSort} />}
                    <TableBody>
                        {paginatedItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
                                    <Typography variant="body1">데이터가 없습니다</Typography>
                                </TableCell>
                            </TableRow>
                        ) : paginatedItems.map((item, index) => (
                            <TableRow key={item.id} onClick={() => handleRowClick(item.id)}
                                sx={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc', transition: 'all 0.15s ease', '&:hover': { backgroundColor: '#f0f4ff', cursor: 'pointer' }, '&:last-child td': { borderBottom: 0 } }}>
                                {columns.map((column) => (
                                    <TableCell key={column.id} sx={{ py: 1.5, px: 2, fontSize: '0.875rem', color: '#374151', borderBottom: '1px solid #f1f5f9' }}>
                                        {column.render ? column.render(item) : item[column.id]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredItems.length > itemsPerPage && (
                <Box display="flex" justifyContent="center" sx={{ '& .MuiPaginationItem-root': { borderRadius: 2, fontWeight: 500, '&.Mui-selected': { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' } } }}>
                    <Pagination count={Math.ceil(filteredItems.length / itemsPerPage)} page={currentPage} onChange={(e, v) => setCurrentPage(v)} shape="rounded" showFirstButton showLastButton />
                </Box>
            )}

            {/* Bulk Upload Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => !uploading && setUploadDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    대량 등록 미리보기 ({uploadedProducts.length}개)
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {uploading && <LinearProgress sx={{ mb: 2 }} />}
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                            <TableBody>
                                {uploadedProducts.slice(0, 10).map((product, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{product.registeredProductName}</TableCell>
                                        <TableCell>{product.deliveryProductName}</TableCell>
                                        <TableCell>{product.productPrice}</TableCell>
                                        <TableCell>{product.boxType}</TableCell>
                                    </TableRow>
                                ))}
                                {uploadedProducts.length > 10 && (
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#9ca3af' }}>
                                            ... 외 {uploadedProducts.length - 10}개
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>취소</Button>
                    <Button variant="contained" onClick={handleBulkUpload} disabled={uploading}
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        {uploading ? '등록 중...' : `${uploadedProducts.length}개 등록`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default React.memo(ProductListPage);

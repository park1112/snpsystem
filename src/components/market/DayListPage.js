import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import {
    Box,
    Typography,
    Button,
    TextField,
    TableContainer,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
    Pagination,
    CircularProgress,
    InputAdornment,
    Chip,
    Checkbox,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Search,
    Add,
    Download,
    PictureAsPdf,
    TableChart,
    SelectAll,
    Deselect,
    MoreVert
} from '@mui/icons-material';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic';
import { logActivity, LOG_ACTIONS, LOG_CATEGORIES } from '../../utils/activityLogger';

const SortableTableHeader = dynamic(() => import('../SortableTableHeader'), { ssr: false });

const DayListPage = () => {
    const [inboundInventories, setInboundInventories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [downloading, setDownloading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const router = useRouter();

    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('updatedAt');
    const [orderDirection, setOrderDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isClient, setIsClient] = useState(false);
    const itemsPerPage = 20;

    // Download Menu
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchInboundInventories = useCallback(async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'daily_summaries'));
            const inboundData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : null,
            }));

            const sortedInboundData = inboundData.sort((a, b) => {
                if (!a.updatedAt) return 1;
                if (!b.updatedAt) return -1;
                return b.updatedAt.getTime() - a.updatedAt.getTime();
            });

            setInboundInventories(sortedInboundData);
        } catch (error) {
            console.error('Error fetching inbound inventories:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInboundInventories();
    }, [fetchInboundInventories]);

    const handleDelete = useCallback(async (inboundId, e) => {
        e?.stopPropagation();
        const targetItem = inboundInventories.find(inv => inv.id === inboundId);
        if (window.confirm("정말로 이 기록을 삭제하시겠습니까?")) {
            try {
                await deleteDoc(doc(db, 'daily_summaries', inboundId));
                setInboundInventories(prevInbound => prevInbound.filter((inv) => inv.id !== inboundId));
                setSelectedIds(prev => prev.filter(id => id !== inboundId));
                setSnackbar({ open: true, message: '삭제되었습니다.', severity: 'success' });

                // 로그 기록
                await logActivity({
                    action: LOG_ACTIONS.DELETE,
                    category: LOG_CATEGORIES.DAILY_SUMMARIES,
                    targetId: inboundId,
                    targetName: targetItem?.marketName || 'Unknown',
                    description: `출고상품 "${targetItem?.marketName || 'Unknown'}" 삭제`,
                });
            } catch (error) {
                console.error('Error deleting:', error);
                setSnackbar({ open: true, message: '삭제 중 오류가 발생했습니다.', severity: 'error' });
            }
        }
    }, [inboundInventories]);

    const handleRowClick = useCallback((id) => {
        router.push(`/market/detail/${id}`);
    }, [router]);

    const handleSelectItem = useCallback((id, e) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    // 데이터 가져오기 (선택된 항목들)
    const fetchSelectedData = useCallback(async () => {
        const dataList = [];
        for (const id of selectedIds) {
            const item = inboundInventories.find(inv => inv.id === id);
            if (item) {
                // 이미 summary가 있으면 그대로 사용, 없으면 Firestore에서 가져오기
                if (item.summary) {
                    dataList.push(item);
                } else {
                    try {
                        const docRef = doc(db, 'daily_summaries', id);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            dataList.push({ id, ...docSnap.data() });
                        }
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                }
            }
        }
        return dataList;
    }, [selectedIds, inboundInventories]);

    // 딜레이 헬퍼 함수
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 다중 PDF 다운로드
    const handleDownloadPDF = useCallback(async () => {
        if (selectedIds.length === 0) {
            setSnackbar({ open: true, message: '다운로드할 항목을 선택하세요.', severity: 'warning' });
            return;
        }

        setDownloading(true);
        setAnchorEl(null);

        try {
            const dataList = await fetchSelectedData();
            const generateSummaryPDF = (await import('./SummaryPDF')).default;

            let downloadedCount = 0;
            for (let i = 0; i < dataList.length; i++) {
                const data = dataList[i];
                try {
                    await generateSummaryPDF(data);
                    downloadedCount++;
                    // 브라우저 팝업 차단 방지를 위해 다운로드 사이에 딜레이 추가
                    if (i < dataList.length - 1) {
                        await delay(500);
                    }
                } catch (err) {
                    console.error(`PDF 생성 오류 (${data.marketName}):`, err);
                }
            }

            setSnackbar({ open: true, message: `${downloadedCount}개 PDF가 다운로드되었습니다.`, severity: 'success' });

            // 로그 기록
            const targetNames = dataList.map(d => d.marketName).join(', ');
            await logActivity({
                action: LOG_ACTIONS.DOWNLOAD,
                category: LOG_CATEGORIES.DAILY_SUMMARIES,
                targetId: selectedIds.join(','),
                targetName: targetNames,
                description: `출고상품 PDF 다운로드 (${downloadedCount}건)`,
                metadata: { format: 'PDF', count: downloadedCount }
            });
        } catch (error) {
            console.error('PDF 생성 오류:', error);
            setSnackbar({ open: true, message: 'PDF 생성 중 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setDownloading(false);
        }
    }, [selectedIds, fetchSelectedData]);

    // 다중 엑셀 다운로드
    const handleDownloadExcel = useCallback(async () => {
        if (selectedIds.length === 0) {
            setSnackbar({ open: true, message: '다운로드할 항목을 선택하세요.', severity: 'warning' });
            return;
        }

        setDownloading(true);
        setAnchorEl(null);

        try {
            const dataList = await fetchSelectedData();
            const workbook = XLSX.utils.book_new();

            dataList.forEach((data, index) => {
                const worksheetData = [
                    ["회원 이름", `${data?.marketName || 'Unknown'}`],
                    ["날짜", data?.updatedAt ? dayjs(data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt).format('YYYY-MM-DD') : 'N/A'],
                    ["총 수량", data?.totalQuantity || 0],
                    ["총 금액", data?.totalPrice || 0],
                    [],
                    ["상품명", "총 수량", "박스 타입", "상품가격", "합계가격"]
                ];

                data?.summary?.forEach(item => {
                    worksheetData.push([
                        item.productName,
                        item.totalQuantity,
                        item.boxType,
                        item.productPrice,
                        item.totalPrice
                    ]);
                });

                const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

                // 컬럼 너비 설정
                worksheet['!cols'] = [
                    { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
                ];

                const sheetName = `${data?.marketName || 'Sheet'}_${index + 1}`.substring(0, 31);
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            });

            const fileName = selectedIds.length === 1
                ? `${dataList[0]?.marketName || 'data'}_${dayjs().format('YYYY-MM-DD')}.xlsx`
                : `출고목록_${dayjs().format('YYYY-MM-DD')}_${selectedIds.length}건.xlsx`;

            XLSX.writeFile(workbook, fileName);
            setSnackbar({ open: true, message: `엑셀 파일이 다운로드되었습니다.`, severity: 'success' });

            // 로그 기록
            const targetNames = dataList.map(d => d.marketName).join(', ');
            await logActivity({
                action: LOG_ACTIONS.DOWNLOAD,
                category: LOG_CATEGORIES.DAILY_SUMMARIES,
                targetId: selectedIds.join(','),
                targetName: targetNames,
                description: `출고상품 Excel 다운로드 (${dataList.length}건)`,
                metadata: { format: 'Excel', count: dataList.length }
            });
        } catch (error) {
            console.error('Excel 생성 오류:', error);
            setSnackbar({ open: true, message: 'Excel 생성 중 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setDownloading(false);
        }
    }, [selectedIds, fetchSelectedData]);

    const columns = useMemo(() => [
        { id: 'updatedAt', label: '업데이트 날짜', render: (item) => item.updatedAt ? dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm') : 'N/A' },
        { id: 'marketName', label: '회원이름' },
        { id: 'totalQuantity', label: '총 수량', render: (item) => item.totalQuantity || 0 },
        { id: 'totalPrice', label: '총 금액', render: (item) => (item.totalPrice || 0).toLocaleString() },
    ], []);

    // Filtering & Sorting
    const filteredItems = useMemo(() =>
        inboundInventories.filter((item) =>
            columns.some((column) => {
                const value = column.render ? column.render(item) : item[column.id];
                return String(value).toLowerCase().includes(searchTerm.toLowerCase());
            })
        ), [inboundInventories, columns, searchTerm]);

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

    const handleSort = useCallback((property, direction) => {
        setOrderBy(property);
        setOrderDirection(direction);
    }, []);

    // 체크박스 핸들러 - filteredItems 정의 이후에 위치해야 함
    const handleSelectAll = useCallback(() => {
        if (selectedIds.length === filteredItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredItems.map(item => item.id));
        }
    }, [selectedIds.length, filteredItems]);

    // Update selectedIds when filteredItems changes
    useEffect(() => {
        setSelectedIds(prev => prev.filter(id => filteredItems.some(item => item.id === id)));
    }, [filteredItems]);

    if (!isClient) return null;

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px"
                sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', borderRadius: 3 }}>
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    const isAllSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredItems.length;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#374151' }}>
                        오픈마켓 출고상품 목록
                    </Typography>
                    <Chip label={`${filteredItems.length}개`} size="small"
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 600 }} />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {/* 선택된 항목 표시 */}
                    {selectedIds.length > 0 && (
                        <Chip
                            label={`${selectedIds.length}개 선택됨`}
                            onDelete={() => setSelectedIds([])}
                            sx={{ backgroundColor: '#e0e7ff', color: '#4f46e5', fontWeight: 600 }}
                        />
                    )}

                    {/* 다운로드 버튼 */}
                    <Button
                        variant="outlined"
                        startIcon={downloading ? <CircularProgress size={16} /> : <Download />}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        disabled={selectedIds.length === 0 || downloading}
                        sx={{
                            borderColor: '#10b981',
                            color: '#10b981',
                            '&:hover': { borderColor: '#059669', backgroundColor: 'rgba(16,185,129,0.04)' },
                            '&.Mui-disabled': { borderColor: '#d1d5db', color: '#9ca3af' }
                        }}
                    >
                        다운로드
                    </Button>

                    {/* 다운로드 메뉴 */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem onClick={handleDownloadPDF}>
                            <ListItemIcon><PictureAsPdf fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
                            <ListItemText>PDF 다운로드 ({selectedIds.length}개)</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleDownloadExcel}>
                            <ListItemIcon><TableChart fontSize="small" sx={{ color: '#10b981' }} /></ListItemIcon>
                            <ListItemText>Excel 다운로드 ({selectedIds.length}개)</ListItemText>
                        </MenuItem>
                    </Menu>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => router.push('/market/market-product-create')}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': { background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)' }
                        }}
                    >
                        상품추가
                    </Button>
                </Box>
            </Box>

            {/* Search */}
            <TextField
                placeholder="검색어를 입력하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                    startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9ca3af' }} /></InputAdornment>
                }}
                sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f8fafc',
                        '&:hover': { backgroundColor: '#f1f5f9' },
                        '&.Mui-focused': { backgroundColor: 'white', boxShadow: '0 0 0 3px rgba(102,126,234,0.1)' },
                        '& fieldset': { borderColor: '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#cbd5e1' },
                        '&.Mui-focused fieldset': { borderColor: '#667eea' }
                    }
                }}
            />

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', mb: 3 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                            <TableCell padding="checkbox" sx={{ borderBottom: '2px solid #e2e8f0' }}>
                                <Tooltip title={isAllSelected ? "전체 해제" : "전체 선택"}>
                                    <Checkbox
                                        checked={isAllSelected}
                                        indeterminate={isIndeterminate}
                                        onChange={handleSelectAll}
                                        sx={{
                                            color: '#9ca3af',
                                            '&.Mui-checked': { color: '#667eea' },
                                            '&.MuiCheckbox-indeterminate': { color: '#667eea' }
                                        }}
                                    />
                                </Tooltip>
                            </TableCell>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    sx={{
                                        fontWeight: 600,
                                        color: '#374151',
                                        borderBottom: '2px solid #e2e8f0',
                                        py: 1.5
                                    }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
                                    <Typography variant="body1">데이터가 없습니다</Typography>
                                </TableCell>
                            </TableRow>
                        ) : paginatedItems.map((item, index) => (
                            <TableRow
                                key={item.id}
                                selected={selectedIds.includes(item.id)}
                                sx={{
                                    backgroundColor: selectedIds.includes(item.id) ? '#f0f4ff' : (index % 2 === 0 ? 'white' : '#f8fafc'),
                                    transition: 'all 0.15s ease',
                                    '&:hover': { backgroundColor: '#f0f4ff', cursor: 'pointer' },
                                    '&.Mui-selected': { backgroundColor: '#e0e7ff' },
                                    '&.Mui-selected:hover': { backgroundColor: '#c7d2fe' }
                                }}
                                onClick={() => handleRowClick(item.id)}
                            >
                                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedIds.includes(item.id)}
                                        onChange={(e) => handleSelectItem(item.id, e)}
                                        sx={{
                                            color: '#9ca3af',
                                            '&.Mui-checked': { color: '#667eea' }
                                        }}
                                    />
                                </TableCell>
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
                <Box display="flex" justifyContent="center" sx={{
                    '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        fontWeight: 500,
                        '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }
                    }
                }}>
                    <Pagination
                        count={Math.ceil(filteredItems.length / itemsPerPage)}
                        page={currentPage}
                        onChange={(e, v) => setCurrentPage(v)}
                        shape="rounded"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default React.memo(DayListPage);

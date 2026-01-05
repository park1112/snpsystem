import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    TextField,
    Box,
    Typography,
    Button,
    TableContainer,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Pagination,
    CircularProgress,
    InputAdornment,
    Chip
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const SortableTableHeader = dynamic(() => import('../SortableTableHeader'), { ssr: false });

const GenericList = React.memo(({
    title,
    items,
    columns,
    onFetch,
    onDelete,
    onEdit,
    onRowClick,
    addButtonText,
    addButtonLink,
    itemsPerPage = 20,
    loading,
    listId,
    defaultOrderBy,
    defaultOrderDirection = 'desc',
    showActions = false // 액션 버튼 표시 여부
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState(defaultOrderBy || columns[0].id);
    const [orderDirection, setOrderDirection] = useState(defaultOrderDirection);
    const [currentPage, setCurrentPage] = useState(1);
    const [isClient, setIsClient] = useState(false);

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        const savedState = JSON.parse(localStorage.getItem(`genericList_${listId}`));
        if (savedState) {
            setSearchTerm(savedState.searchTerm || '');
            const validOrderBy = columns.some(col => col.id === savedState.orderBy);
            setOrderBy(validOrderBy ? savedState.orderBy : (defaultOrderBy || columns[0].id));
            setOrderDirection(savedState.orderDirection || defaultOrderDirection);
            setCurrentPage(savedState.currentPage || 1);
        }
    }, [listId, columns, defaultOrderBy, defaultOrderDirection]);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem(`genericList_${listId}`, JSON.stringify({
                searchTerm,
                orderBy,
                orderDirection,
                currentPage
            }));
        }
    }, [isClient, searchTerm, orderBy, orderDirection, currentPage, listId]);

    useEffect(() => {
        if (isClient && items.length > 0) {
            const maxPage = Math.ceil(items.length / itemsPerPage);
            if (currentPage > maxPage) {
                setCurrentPage(Math.max(1, maxPage));
            }
        }
    }, [isClient, items.length, itemsPerPage, currentPage]);

    const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);

    const handleSort = useCallback((property, direction) => {
        setOrderBy(property);
        setOrderDirection(direction);
    }, []);

    const filteredItems = useMemo(() =>
        items.filter((item) =>
            columns.some((column) => {
                const value = column.render ? column.render(item) : item[column.id];
                return String(value).toLowerCase().includes(searchTerm.toLowerCase());
            })
        ),
        [items, columns, searchTerm]
    );

    const sortedItems = useMemo(() =>
        [...filteredItems].sort((a, b) => {
            const aValue = a[orderBy] || '';
            const bValue = b[orderBy] || '';
            if (aValue < bValue) return orderDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return orderDirection === 'asc' ? 1 : -1;
            return 0;
        }),
        [filteredItems, orderBy, orderDirection]
    );

    const paginatedItems = useMemo(() =>
        sortedItems.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        ),
        [sortedItems, currentPage, itemsPerPage]
    );

    const handlePageChange = useCallback((e, value) => setCurrentPage(value), []);

    if (!isClient) {
        return null;
    }

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="400px"
                sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', borderRadius: 3 }}
            >
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: '#374151',
                        }}
                    >
                        {title}
                    </Typography>
                    <Chip
                        label={`${filteredItems.length}개`}
                        size="small"
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 600
                        }}
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => router.push(addButtonLink)}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                        }
                    }}
                >
                    {addButtonText}
                </Button>
            </Box>

            {/* Search */}
            <TextField
                placeholder="검색어를 입력하세요..."
                value={searchTerm}
                onChange={handleSearchChange}
                fullWidth
                size="small"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search sx={{ color: '#9ca3af' }} />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f8fafc',
                        transition: 'all 0.2s',
                        '&:hover': {
                            backgroundColor: '#f1f5f9',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'white',
                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                        },
                        '& fieldset': {
                            borderColor: '#e2e8f0',
                        },
                        '&:hover fieldset': {
                            borderColor: '#cbd5e1',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                        }
                    }
                }}
            />

            {/* Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    mb: 3
                }}
            >
                <Table size="small">
                    {isClient && (
                        <SortableTableHeader
                            columns={columns}
                            orderBy={orderBy}
                            orderDirection={orderDirection}
                            onSort={handleSort}
                        />
                    )}
                    <TableBody>
                        {paginatedItems.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    sx={{
                                        textAlign: 'center',
                                        py: 8,
                                        color: '#9ca3af'
                                    }}
                                >
                                    <Typography variant="body1">데이터가 없습니다</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedItems.map((item, index) => (
                                <TableRow
                                    key={item.id}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc',
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                            backgroundColor: '#f0f4ff',
                                            cursor: 'pointer',
                                            transform: 'scale(1.001)',
                                        },
                                        '&:last-child td': {
                                            borderBottom: 0
                                        }
                                    }}
                                    onClick={() => onRowClick && onRowClick(item.id)}
                                >
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            sx={{
                                                py: 1.5,
                                                px: 2,
                                                fontSize: '0.875rem',
                                                color: '#374151',
                                                borderBottom: '1px solid #f1f5f9'
                                            }}
                                        >
                                            {column.render ? column.render(item) : item[column.id]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredItems.length > itemsPerPage && (
                <Box
                    display="flex"
                    justifyContent="center"
                    sx={{
                        '& .MuiPagination-ul': {
                            gap: 0.5
                        },
                        '& .MuiPaginationItem-root': {
                            borderRadius: 2,
                            fontWeight: 500,
                            '&.Mui-selected': {
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                }
                            }
                        }
                    }}
                >
                    <Pagination
                        count={Math.ceil(filteredItems.length / itemsPerPage)}
                        page={currentPage}
                        onChange={handlePageChange}
                        shape="rounded"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Box>
    );
});

export default GenericList;

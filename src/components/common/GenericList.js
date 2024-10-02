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
    IconButton,
    Pagination,
    CircularProgress
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
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
    onRowClick,  // 새로 추가된 prop
    addButtonText,
    addButtonLink,
    itemsPerPage = 20,
    loading
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState(columns[0].id);
    const [orderDirection, setOrderDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isClient, setIsClient] = useState(false);

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

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
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box mt={5}>
            <Typography variant="h4" gutterBottom>
                {title}
            </Typography>
            <TextField
                label="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                margin="normal"
                fullWidth
            />
            <Button variant="contained" color="primary" onClick={() => router.push(addButtonLink)} sx={{ mt: 2, mb: 2 }}>
                {addButtonText}
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    {isClient && (
                        <SortableTableHeader
                            columns={columns}
                            orderBy={orderBy}
                            orderDirection={orderDirection}
                            onSort={handleSort}
                        />
                    )}
                    <TableBody>
                        {paginatedItems.map((item, index) => (
                            <TableRow
                                key={item.id}
                                sx={{
                                    backgroundColor: index % 2 === 1 ? 'rgba(240, 240, 240, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                                    '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)', cursor: 'pointer' },
                                }}
                                onClick={() => onRowClick && onRowClick(item.id)}  // 수정된 부분
                            >
                                {columns.map((column) => (
                                    <TableCell key={column.id}>
                                        {column.render ? column.render(item) : item[column.id]}
                                    </TableCell>
                                ))}
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <IconButton onClick={() => onEdit(item.id)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={() => onDelete(item.id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                    count={Math.ceil(filteredItems.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Box>
    );
});

export default GenericList;
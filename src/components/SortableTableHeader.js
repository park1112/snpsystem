import { TableCell, TableSortLabel, TableHead, TableRow } from '@mui/material';

const SortableTableHeader = ({ columns, orderBy, orderDirection, onSort }) => {
    const handleSort = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        onSort(property, isAsc ? 'desc' : 'asc');
    };

    return (
        <TableHead>
            <TableRow
                sx={{
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0',
                }}
            >
                {columns.map((column) => (
                    <TableCell
                        key={column.id}
                        sx={{
                            color: '#374151',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            py: 1.5,
                            px: 2,
                            borderBottom: 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? orderDirection : 'asc'}
                            onClick={() => handleSort(column.id)}
                            sx={{
                                color: '#374151',
                                '&:hover': {
                                    color: '#667eea',
                                },
                                '&.Mui-active': {
                                    color: '#667eea',
                                },
                                '& .MuiTableSortLabel-icon': {
                                    color: '#667eea !important',
                                },
                            }}
                        >
                            {column.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};

export default SortableTableHeader;

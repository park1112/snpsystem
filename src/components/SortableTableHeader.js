import { TableCell, TableSortLabel } from '@mui/material';

const SortableTableHeader = ({ columns, orderBy, orderDirection, onSort }) => {
    const handleSort = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        onSort(property, isAsc ? 'desc' : 'asc');
    };

    return (
        <>
            {columns.map((column) => (
                <TableCell key={column.id}>
                    <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? orderDirection : 'asc'}
                        onClick={() => handleSort(column.id)}
                    >
                        {column.label}
                    </TableSortLabel>
                </TableCell>
            ))}
        </>
    );
};

export default SortableTableHeader;

import PropTypes from 'prop-types';
import { Checkbox, TableRow, TableCell, Typography, Button } from '@mui/material';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';

SelectTableRow.propTypes = {
    row: PropTypes.object,
    selected: PropTypes.bool,
    onSelectRow: PropTypes.func,
    onButtonClick: PropTypes.func, // 추가된 Prop
};

export default function SelectTableRow({ row, selected, onSelectRow, onButtonClick }) {
    const { warehouseName, itemCode, productName, quantity, partnerCategory, status } = row;

    return (
        <TableRow hover selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox checked={selected} onClick={onSelectRow} />
            </TableCell>

            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2" noWrap>
                    {warehouseName}
                </Typography>
            </TableCell>
            <TableCell align="left">{itemCode}</TableCell>
            <TableCell align="left">{productName}</TableCell>
            <TableCell align="left">{quantity}</TableCell>
            <TableCell align="left">{partnerCategory}</TableCell>
            <TableCell align="left">
                <Label variant="ghost" color={(status === '선별대기' && 'warning') || 'success'}>
                    {status}
                </Label>
            </TableCell>

            <TableCell align="right">
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="eva:arrow-forward-outline" />}
                    onClick={onButtonClick} // 클릭 시 실행될 함수
                >
                    바로가기
                </Button>
            </TableCell>
        </TableRow>
    );
}

import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { Box, Tab, Tabs, Card, Table, Switch, Button, Tooltip, Divider, TableBody, Container, IconButton, TableContainer, TablePagination, FormControlLabel, CircularProgress } from '@mui/material';
import { PATH_DASHBOARD } from '../../routes/paths';
import useTabs from '../../hooks/useTabs';
import useSettings from '../../hooks/useSettings';
import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
import Layout from '../../layouts';
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import TableEmptyRows from '../../components/table/TableEmptyRows';
import TableHeadCustom from '../../components/table/TableHeadCustom';
import TableNoData from '../../components/table/TableNoData';
import TableSelectedActions from '../../components/table/TableSelectedActions';
import UserTableToolbar from './UserTableToolbar';
import UserTableRow from './UserTableRow';
import { db } from '../../utils/firebase';
import { paramCase } from 'change-case';

const TABLE_HEAD = [
    { id: 'warehouseName', label: 'Warehouse Name', align: 'left' },
    { id: 'itemCode', label: 'ItemCode', align: 'left' },
    { id: 'productName', label: 'Product Name', align: 'left' },
    { id: 'quantity', label: 'Quantity', align: 'left' },
    { id: 'partnerCategory', label: 'Partner Category', align: 'left' },
    { id: 'status', label: 'Status', align: 'left' },
    { id: '' },
];


UserList.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default function UserList() {
    const {
        dense,
        page,
        order,
        orderBy,
        rowsPerPage,
        setPage,
        selected,
        setSelected,
        onSelectRow,
        onSelectAllRows,
        onSort,
        onChangeDense,
        onChangePage,
        onChangeRowsPerPage,
    } = useTable();

    const { themeStretch } = useSettings();
    const { push } = useRouter();

    const [tableData, setTableData] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [filterWarehouse, setFilterWarehouse] = useState('all');
    const [loading, setLoading] = useState(true);
    const { currentTab: filterStatus, onChangeTab: onChangeFilterStatus } = useTabs('all');

    // useEffect 내의 데이터 처리 로직 수정
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const warehouseSnapshot = await getDocs(collection(db, 'warehouses'));
                const warehouseData = warehouseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setWarehouses(warehouseData);

                const q = query(
                    collection(db, 'warehouse_inventory'),
                    where('status', '==', '입고')
                );

                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.flatMap(doc => {
                    const data = doc.data();
                    return data.products.map(product => ({
                        id: `${doc.id}-${product.productName}`,
                        warehouseName: data.warehouseName,
                        warehouseUid: data.warehouseUid,
                        itemCode: data.itemCode,
                        status: data.status,
                        subCategory: data.subCategory,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                        ...product
                    }));
                });
                console.log('Fetched items:', items);  // 추가된 로그
                // 수신 데이터를 날짜별로 내림차순으로 정렬합니다.
                const itemsData = items.sort((a, b) => {
                    if (!a.createdAt) return 1;  // 날짜가 없는 항목은 마지막에 넣으세요
                    if (!b.createdAt) return -1; // 날짜가 없는 항목은 마지막에 넣으세요
                    return b.createdAt - a.createdAt;
                });

                setTableData(itemsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const handleFilterName = (filterName) => {
        setFilterName(filterName);
        setPage(0);
    };

    const handleFilterWarehouse = (event) => {
        setFilterWarehouse(event.target.value);
    };

    const handleDeleteRow = (id) => {
        const deleteRow = tableData.filter((row) => row.id !== id);
        setSelected([]);
        setTableData(deleteRow);
    };

    const handleDeleteRows = (selected) => {
        const deleteRows = tableData.filter((row) => !selected.includes(row.id));
        setSelected([]);
        setTableData(deleteRows);
    };

    const handleEditRow = (id) => {
        push(PATH_DASHBOARD.user.edit(paramCase(id)));
    };

    const dataFiltered = useMemo(
        () => applySortFilter({
            tableData,
            comparator: getComparator(order, orderBy),
            filterName,
            filterWarehouse,
            filterStatus,
            warehouses,
        }),
        [tableData, order, orderBy, filterName, filterWarehouse, filterStatus, warehouses]
    );

    const denseHeight = dense ? 52 : 72;

    const handleMoveToSelectionWaiting = async (selectedIds) => {
        try {
            // 선택된 각 항목에 대해 Firestore 업데이트 수행
            const updatePromises = selectedIds.map(async (id) => {
                const [docId, productName] = id.split('-');
                const docRef = doc(db, 'warehouse_inventory', docId);

                // 해당 문서의 products 배열에서 특정 제품을 찾아 상태 업데이트
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const updatedProducts = data.products.map(product => {
                        if (product.productName === productName) {
                            return { ...product, status: '선별대기' };
                        }
                        return product;
                    });

                    await updateDoc(docRef, { products: updatedProducts });
                }
            });

            await Promise.all(updatePromises);

            // 상태 업데이트 및 선택 해제
            setTableData(prevData =>
                prevData.map(item =>
                    selectedIds.includes(item.id)
                        ? { ...item, status: '선별대기' }
                        : item
                )
            );
            setSelected([]);
            alert('선택된 항목이 선별대기 상태로 변경되었습니다.');
        } catch (error) {
            console.error('Error updating to selection waiting:', error);
            alert('상태 변경 중 오류가 발생했습니다.');
        }
    };

    const isNotFound =
        (!dataFiltered.length && !!filterName) ||
        (!dataFiltered.length && !!filterWarehouse) ||
        (!dataFiltered.length && !!filterStatus);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Page title="Warehouse-inventory-input : List">
            <Container maxWidth={themeStretch ? false : 'lg'}>
                <HeaderBreadcrumbs
                    heading="Warehouse-inventory-input"
                    links={[
                        { name: 'Dashboard', href: PATH_DASHBOARD.root },
                        { name: 'Warehouse-inventory-input', href: PATH_DASHBOARD.user.root },
                        { name: 'List' },
                    ]}
                    action={
                        <NextLink href={PATH_DASHBOARD.user.new} passHref>
                            <Button variant="contained" startIcon={<Iconify icon={'eva:plus-fill'} />}>
                                New User
                            </Button>
                        </NextLink>
                    }
                />

                <Card>
                    <Tabs
                        allowScrollButtonsMobile
                        variant="scrollable"
                        scrollButtons="auto"
                        value={filterStatus}
                        onChange={onChangeFilterStatus}
                        sx={{ px: 2, bgcolor: 'background.neutral' }}
                    >
                        <Tab disableRipple key="all" label="All" value="all" />
                        {warehouses.map((warehouse) => (
                            <Tab disableRipple key={warehouse.id} label={warehouse.name} value={warehouse.id} />
                        ))}
                    </Tabs>

                    <Divider />

                    <UserTableToolbar
                        filterName={filterName}
                        filterRole={filterWarehouse}
                        onFilterName={handleFilterName}
                        onFilterRole={handleFilterWarehouse}
                        optionsRole={['all', ...warehouses.map(warehouse => warehouse.name)]}
                    />

                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
                            {selected.length > 0 && (
                                <TableSelectedActions
                                    dense={dense}
                                    numSelected={selected.length}
                                    rowCount={tableData.length}
                                    onSelectAllRows={(checked) =>
                                        onSelectAllRows(
                                            checked,
                                            tableData.map((row) => row.id)
                                        )
                                    }
                                    actions={
                                        <>
                                            <Tooltip title="Delete">
                                                <IconButton color="primary" onClick={() => handleDeleteRows(selected)}>
                                                    <Iconify icon={'eva:trash-2-outline'} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Move to Selection Waiting">
                                                <IconButton color="primary" onClick={() => handleMoveToSelectionWaiting(selected)}>
                                                    <Iconify icon={'eva:arrow-forward-outline'} />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    }
                                />
                            )}

                            <Table size={dense ? 'small' : 'medium'}>
                                <TableHeadCustom
                                    order={order}
                                    orderBy={orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={tableData.length}
                                    numSelected={selected.length}
                                    onSort={onSort}
                                    onSelectAllRows={(checked) =>
                                        onSelectAllRows(
                                            checked,
                                            tableData.map((row) => row.id)
                                        )
                                    }
                                />

                                <TableBody>
                                    {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <UserTableRow
                                            key={row.id}
                                            row={row}
                                            selected={selected.includes(row.id)}
                                            onSelectRow={() => onSelectRow(row.id)}
                                            onDeleteRow={() => handleDeleteRow(row.id)}
                                            onEditRow={() => handleEditRow(row.name)}
                                        />
                                    ))}

                                    <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, tableData.length)} />

                                    <TableNoData isNotFound={isNotFound} />
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Scrollbar>

                    <Box sx={{ position: 'relative' }}>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={dataFiltered.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={onChangePage}
                            onRowsPerPageChange={onChangeRowsPerPage}
                        />

                        <FormControlLabel
                            control={<Switch checked={dense} onChange={onChangeDense} />}
                            label="Dense"
                            sx={{ px: 3, py: 1.5, top: 0, position: { md: 'absolute' } }}
                        />
                    </Box>
                </Card>
            </Container>
        </Page>
    );
}

// applySortFilter 함수 수정
function applySortFilter({ tableData, comparator, filterName, filterStatus, filterWarehouse, warehouses }) {
    const stabilizedThis = tableData.map((el, index) => [el, index]);

    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    tableData = stabilizedThis.map((el) => el[0]);

    if (filterName) {
        tableData = tableData.filter((item) =>
            item.productName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
            item.warehouseName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
            item.teamName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
        );
    }

    if (filterWarehouse !== 'all') {
        const selectedWarehouse = warehouses.find(w => w.name === filterWarehouse);
        if (selectedWarehouse) {
            tableData = tableData.filter((item) => item.warehouseUid === selectedWarehouse.id);
        }
    }

    if (filterStatus !== 'all') {
        tableData = tableData.filter((item) => item.warehouseUid === filterStatus);
    }

    return tableData;
}


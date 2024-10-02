import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
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
import UserTableToolbar from '../warehouse-inventory-input/UserTableToolbar';
import SelectTableRow from './SelectTableRow';
import { db } from '../../utils/firebase';
import { paramCase } from 'change-case';
import { serverTimestamp } from 'firebase/firestore';

const TABLE_HEAD = [
    { id: 'warehouseName', label: 'Warehouse Name', align: 'left' },
    { id: 'itemCode', label: 'ItemCode', align: 'left' },
    { id: 'productName', label: 'Product Name', align: 'left' },
    { id: 'quantity', label: 'Quantity', align: 'left' },
    { id: 'partnerCategory', label: 'Partner Category', align: 'left' },
    { id: 'status', label: 'Status', align: 'left' },
    { id: '' },
];

WarehouseProductionList.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default function WarehouseProductionList({ warehouseUid }) {
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

    const [tableData, setTableData] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [loading, setLoading] = useState(true);
    const { currentTab: filterStatus, onChangeTab: onChangeFilterStatus } = useTabs('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (warehouseUid) {
                    const q = query(
                        collection(db, 'warehouse_inventory'),
                        where('warehouseUid', '==', warehouseUid),
                        where('status', '==', '선별대기')
                    );

                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
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

                        const itemsData = items.sort((a, b) => {
                            if (!a.createdAt) return 1;
                            if (!b.createdAt) return -1;
                            return b.createdAt - a.createdAt;
                        });

                        setTableData(itemsData);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [warehouseUid]);

    const handleFilterName = (filterName) => {
        setFilterName(filterName);
        setPage(0);
    };




    const handleMoveToSorterInput = async (selectedIds) => {
        try {
            // 선택된 각 항목에 대해 Firestore 업데이트 수행
            const updatePromises = selectedIds.map(async (id) => {
                // ID에서 docId만 분리 (예시에서는 '-'로 구분된 문자열)
                const [docId] = id.split('-');
                const docRef = doc(db, 'warehouse_inventory', docId);

                console.log(`Updating document: ${docId} with status '선별기투입'`);

                // Firestore 문서의 status 필드를 '선별기투입'으로, 그리고 '선별기투입된시간' 필드를 현재 시간으로 업데이트
                await updateDoc(docRef, {
                    status: '선별기투입',
                    investedTime: serverTimestamp(), // 서버 타임스탬프 사용
                });

                console.log(`Document ${docId} updated with status '선별기투입' and timestamp`);
            });

            // 모든 업데이트가 완료될 때까지 기다림
            await Promise.all(updatePromises);

            // 상태 업데이트 및 선택 해제
            setTableData(prevData =>
                prevData
                    .map(item =>
                        selectedIds.includes(item.id)
                            ? { ...item, status: '선별기투입', investedTime: new Date().toISOString() } // 로컬 타임스탬프도 반영
                            : item
                    )
                    .filter(item => item.status !== '선별대기') // 선별대기 상태의 항목을 필터링하여 제거
            );
            setSelected([]);
            alert('선택된 항목이 선별기투입 상태로 변경되었습니다.');
        } catch (error) {
            console.error('Error updating to selection waiting:', error);
            alert('상태 변경 중 오류가 발생했습니다.');
        }
    };





    const dataFiltered = useMemo(
        () => applySortFilter({
            tableData,
            comparator: getComparator(order, orderBy),
            filterName,
            filterStatus,
        }),
        [tableData, order, orderBy, filterName, filterStatus]
    );

    const denseHeight = dense ? 52 : 72;

    const isNotFound =
        (!dataFiltered.length && !!filterName) ||
        (!dataFiltered.length && !!filterStatus);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Page title="Warehouse-Production-List : List">
            <Container maxWidth={themeStretch ? false : 'lg'}>
                <HeaderBreadcrumbs
                    heading="Warehouse-Production-List"
                    links={[
                        { name: 'Dashboard', href: PATH_DASHBOARD.root },
                        { name: 'Warehouse-Production-List', href: PATH_DASHBOARD.user.root },
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
                    </Tabs>

                    <Divider />

                    <UserTableToolbar
                        filterName={filterName}
                        filterRole={'all'}
                        onFilterName={handleFilterName}
                        optionsRole={['all']}
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
                                            <Tooltip title="선별기투입">
                                                <IconButton color="primary" onClick={() => handleMoveToSorterInput(selected)}>
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
                                        <SelectTableRow
                                            key={row.id}
                                            row={row}
                                            selected={selected.includes(row.id)}
                                            onSelectRow={() => onSelectRow(row.id)}
                                            onButtonClick={() => handleMoveToSorterInput([row.id])} // "바로가기" 버튼 클릭 시 실행될 함수
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

function applySortFilter({ tableData, comparator, filterName, filterStatus }) {
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

    return tableData;
}

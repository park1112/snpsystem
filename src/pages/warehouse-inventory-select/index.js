import WarehouseInventorySelectList from '../../sections/warehouse-inventory-select/WarehouseInventorySelectList';
import Layout from '../../layouts';

const WarehouseInventorySelectListPage = () => <WarehouseInventorySelectList />;

WarehouseInventorySelectListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WarehouseInventorySelectListPage;

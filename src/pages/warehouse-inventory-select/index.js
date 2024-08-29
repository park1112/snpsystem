import WarehouseInventoryInputList from '../../sections/warehouse-inventory-input/WarehouseInventoryInputList';
import Layout from '../../layouts';

const WarehouseInventorySelectListPage = () => {
    return <WarehouseInventoryInputList />;
};

WarehouseInventorySelectListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WarehouseInventorySelectListPage;

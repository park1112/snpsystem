import WarehouseInventoryInputList from '../../sections/warehouse-inventory-input/WarehouseInventoryInputList';
import Layout from '../../layouts';

const WarehouseInventoryInputListPage = () => <WarehouseInventoryInputList />;

WarehouseInventoryInputListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WarehouseInventoryInputListPage;

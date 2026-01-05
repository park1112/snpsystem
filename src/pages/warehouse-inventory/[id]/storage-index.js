import WarehouseInventory from '../../../components/warehouse-inventory/WarehouseInventory';
import Layout from '../../../layouts';

const WarehouseInventoryPage = () => <WarehouseInventory />;

WarehouseInventoryPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WarehouseInventoryPage;

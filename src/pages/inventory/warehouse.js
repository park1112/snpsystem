import WarehouseInventoryList from '../../components/inventory/WarehouseInventoryList';
import Layout from '../../layouts';

const InventoryListPage = () => <WarehouseInventoryList />;

InventoryListPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default InventoryListPage;

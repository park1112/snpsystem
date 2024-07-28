import WarehouseInventoryList from '../../components/inventory/WarehouseInventoryList';
import Layout from '../../layouts';

const InventoryListPage = () => {
  return <WarehouseInventoryList />;
};

InventoryListPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default InventoryListPage;

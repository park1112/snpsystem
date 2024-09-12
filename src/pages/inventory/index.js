import InventoryList from '../../components/inventory/InventoryList';
import Layout from '../../layouts';

const InventoryListPage = () => <InventoryList />;

InventoryListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default InventoryListPage;

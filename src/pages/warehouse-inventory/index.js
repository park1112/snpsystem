import InboundInventoryList from '../../components/warehouse-inventory/InboundInventoryList';
import Layout from '../../layouts';

const WarehouseInventoryListPage = () => <InboundInventoryList />;

WarehouseInventoryListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WarehouseInventoryListPage;

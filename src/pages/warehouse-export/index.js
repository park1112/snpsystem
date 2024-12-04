import InboundInventoryList from '../../components/warehouse-inventory/InboundInventoryList';
import Layout from '../../layouts';

const WarehouseExportPage = () => <InboundInventoryList />;

WarehouseExportPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WarehouseExportPage;
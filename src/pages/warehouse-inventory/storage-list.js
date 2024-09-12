import WarehouseStorageManagement from '../../components/warehouse-inventory/WarehouseStorageManagement';
import Layout from '../../layouts';

const StorageListPage = () => <WarehouseStorageManagement />;

StorageListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default StorageListPage;

import WarehouseProductionList from '../../sections/warehouse-inventory-select/WarehouseProductionList';
import { useRouter } from 'next/router';
import Layout from '../../layouts';

const WarehouseInventorySelectDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    return <WarehouseProductionList warehouseUid={id} />;
};

WarehouseInventorySelectDetailPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WarehouseInventorySelectDetailPage;





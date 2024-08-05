import { useRouter } from 'next/router';
import WarehouseDetail from '../../../components/warehouses/WarehouseDetail';
import Layout from '../../../layouts';

export default function WarehouseDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <WarehouseDetail warehouseId={id} />}
        </Layout>
    );
}

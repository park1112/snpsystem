import { useRouter } from 'next/router';
import InventoryDetail from '../../../components/inventory/InventoryDetail';
import Layout from '../../../layouts';

export default function InventoryDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <InventoryDetail inventoryId={id} />}
        </Layout>
    );
}

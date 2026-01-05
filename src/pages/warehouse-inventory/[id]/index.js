import { useRouter } from 'next/router';
import InboundInventoryDetails from '../../../components/warehouse-inventory/InboundInventoryDetails';
import Layout from '../../../layouts';

export default function InboundInventoryDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <InboundInventoryDetails teamId={id} />}
        </Layout>
    );
}

import { useRouter } from 'next/router';
import ShippingDetails from '../../components/shipping/ShippingDetails';
import Layout from '../../layouts';

export default function ShippingDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <ShippingDetails inventoryId={id} />}
        </Layout>
    );
}



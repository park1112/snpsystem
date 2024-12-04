import { useRouter } from 'next/router';
import ShippingEdit from '../../../components/shipping/ShippingEdit';
import Layout from '../../../layouts';

export default function ShippingEditPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <ShippingEdit inventoryId={id} />}
        </Layout>
    );
}



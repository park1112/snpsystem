import { useRouter } from 'next/router';
import TransportDetail from '../../../components/transports/TransportDetail';
import Layout from '../../../layouts';

export default function TransportDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <TransportDetail transportId={id} />}
        </Layout>
    );
}

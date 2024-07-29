import { useRouter } from 'next/router';
import LogisticsDetail from '../../../components/logistics/LogisticsDetail';
import Layout from '../../../layouts';

export default function LogisticsDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <LogisticsDetail logisticsId={id} />}
        </Layout>
    );
}

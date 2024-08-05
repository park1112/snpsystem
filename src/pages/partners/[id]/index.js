import { useRouter } from 'next/router';
import PartnerDetail from '../../../components/partners/PartnerDetail';
import Layout from '../../../layouts';

export default function PartnerDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <PartnerDetail partnerId={id} />}
        </Layout>
    );
}

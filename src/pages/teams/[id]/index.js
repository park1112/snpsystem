import { useRouter } from 'next/router';
import TeamDetail from '../../../components/teams/TeamDetail';
import Layout from '../../../layouts';

export default function TeamDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <TeamDetail teamId={id} />}
        </Layout>
    );
}

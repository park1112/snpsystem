import { useRouter } from 'next/router';
import UserDetail from '../../components/user/UserDetail';
import Layout from '../../layouts';

export default function UserDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <UserDetail userId={id} />}
        </Layout>
    );
}

import NotificationDetailPage from '../../components/notifications/NotificationDetailPage';
import Layout from '../../layouts';
import { useRouter } from 'next/router';

const NotificationsListPage = () => {
    const router = useRouter();
    const { id } = router.query;

    return <NotificationDetailPage detailId={id} />;
};

NotificationsListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default NotificationsListPage;

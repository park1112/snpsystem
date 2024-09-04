import SystemNotificationDetail from '../../components/notifications/SystemNotificationDetail';
import Layout from '../../layouts';
import { useRouter } from 'next/router';

const NotificationsListPage = () => {
    const router = useRouter();
    const { id } = router.query;

    return <SystemNotificationDetail detailId={id} />;
};

NotificationsListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default NotificationsListPage;

import SystemNotificationsList from '../../components/notifications/SystemNotificationsList';
import Layout from '../../layouts';

const NotificationsListPage = () => {
    return <SystemNotificationsList />;
};

NotificationsListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default NotificationsListPage;

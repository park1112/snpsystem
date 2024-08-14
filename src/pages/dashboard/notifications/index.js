
import AllNotificationsPage from '../../../components/notifications/fetchNotifications';
import Layout from '../../../layouts';

const NotificationsPage = () => {
    return <AllNotificationsPage />;
};

NotificationsPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default NotificationsPage;

import AllNotificationsPage from '../../components/notifications/AllNotificationsPage';
import Layout from '../../layouts';

const NotificationsListPage = () => {
    return <AllNotificationsPage />;
};

NotificationsListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default NotificationsListPage;
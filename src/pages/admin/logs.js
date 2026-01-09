import Layout from '../../layouts';
import ActivityLogsPage from '../../components/admin/ActivityLogsPage';

const AdminLogsPage = () => <ActivityLogsPage />;

AdminLogsPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AdminLogsPage;

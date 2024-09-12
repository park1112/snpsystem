
import LogisticsManagement from '../../components/logistics-management/LogisticsManagement';
import Layout from '../../layouts';

const LogisticsManagementPage = () => <LogisticsManagement />;

LogisticsManagementPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default LogisticsManagementPage;

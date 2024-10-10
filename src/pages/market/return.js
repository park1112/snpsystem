import Layout from '../../layouts';
import ReturnManagement from '../../components/market/ReturnManagement';

const ReturnManagementPage = () => <ReturnManagement />;

ReturnManagementPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default ReturnManagementPage;
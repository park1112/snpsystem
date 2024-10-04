import VersionHistoryPage from '../../components/version/VersionHistoryPage';
import Layout from '../../layouts';

const VersionPage = () => <VersionHistoryPage />;

VersionPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default VersionPage;
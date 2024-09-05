import VersionHistoryPage from '../../components/version/VersionHistoryPage';
import Layout from '../../layouts';

const VersionPage = () => {
    return <VersionHistoryPage />;
};

VersionPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default VersionPage;

import LogisticsList from '../../components/logistics/LogisticsList';
import Layout from '../../layouts';

const LogisticsListPage = () => {
    return <LogisticsList />;
};

LogisticsListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default LogisticsListPage;

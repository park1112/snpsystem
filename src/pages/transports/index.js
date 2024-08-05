import TransportList from '../../components/transports/TransportList';
import Layout from '../../layouts';

const TransportListPage = () => {
    return <TransportList />;
};

TransportListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default TransportListPage;

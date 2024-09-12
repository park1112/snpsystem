import Layout from '../../layouts';
import MarketManagement from '../../components/market/MarketManagement';


const MarketListPage = () => <MarketManagement />;

MarketListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default MarketListPage;

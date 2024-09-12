import Layout from '../../layouts';
import OpenMarketManagementPage from '../../components/market/OpenMarketManagementPage';

const MarketCreatePage = () => <OpenMarketManagementPage />;

MarketCreatePage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default MarketCreatePage;

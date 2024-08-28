import Layout from '../../../layouts';
import DetailPage from '../../../components/market/DetailPage';


const MarketDetailPage = () => {
    return <DetailPage />;
};

MarketDetailPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default MarketDetailPage;

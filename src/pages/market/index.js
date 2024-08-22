import Layout from '../../layouts';
import PageOne from '../../components/market/PageOne';


const MarketListPage = () => {
    return <PageOne />;
};

MarketListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default MarketListPage;

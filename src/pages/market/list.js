import Layout from '../../layouts';
import ProductListPage from '../../components/market/ProductListPage';


const MarketListPage = () => {
    return <ProductListPage />;
};

MarketListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default MarketListPage;

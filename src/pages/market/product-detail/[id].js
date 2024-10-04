import Layout from '../../../layouts';
import ProductDetailPage from '../../../components/market/ProductDetailPage';


const MarketProductDetailPage = () => <ProductDetailPage />;

MarketProductDetailPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default MarketProductDetailPage;

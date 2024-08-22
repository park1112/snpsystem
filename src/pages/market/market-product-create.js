import Layout from '../../layouts';
import ProductCreationPage from '../../components/market/ProductCreationPage';


const MarketProductCreatePage = () => {
    return <ProductCreationPage />;
};

MarketProductCreatePage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default MarketProductCreatePage;

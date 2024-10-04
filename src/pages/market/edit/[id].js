import Layout from '../../../layouts';
import ProductCreationPage from '../../../components/market/ProductCreationPage';


const MarketEditPage = () => <ProductCreationPage />;

MarketEditPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default MarketEditPage;

import Layout from '../../layouts';
import BulkProductCreationPage from '../../components/market/BulkProductCreationPage';


const BulkCreatePage = () => <BulkProductCreationPage />;

BulkCreatePage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default BulkCreatePage;

import Layout from '../../layouts';
import Page from '../../components/Page';
import BulkDataUploadPage from '../../components/bulk/BulkDataUploadPage';

const BulkPage = () => <BulkDataUploadPage />;

BulkPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default BulkPage;


import Layout from '../../layouts';
import Page from '../../components/Page';
import AdminPage from '../../components/admin/AdminPage';


const ProductListPage = () => {
    return <AdminPage />;
};

ProductListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default ProductListPage;

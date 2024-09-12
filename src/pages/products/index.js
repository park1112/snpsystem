import ProductList from '../../components/products/ProductList';
import Layout from '../../layouts';
import Page from '../../components/Page';

const ProductListPage = () => <ProductList />;

ProductListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default ProductListPage;

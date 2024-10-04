import ShippingList from '../../components/shipping/ShippingList';
import Layout from '../../layouts';

const ShippingListPage = () => <ShippingList />;

ShippingListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default ShippingListPage;

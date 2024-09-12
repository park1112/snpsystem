import ShippingRegistration from '../../components/shipping/ShippingRegistration';
import Layout from '../../layouts';

const ShippingListPage = () => <ShippingRegistration />;

ShippingListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default ShippingListPage;

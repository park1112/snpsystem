import ShippingForm from '../../components/shipping/ShippingForm';
import Layout from '../../layouts';

const AddShippingPage = () => <ShippingForm />;

AddShippingPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddShippingPage;

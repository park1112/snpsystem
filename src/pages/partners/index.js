import PartnerList from '../../components/partners/PartnerList';
import Layout from '../../layouts';

const PartnerListPage = () => <PartnerList />;

PartnerListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default PartnerListPage;

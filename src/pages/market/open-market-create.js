import Layout from '../../layouts';
import OpenMarketCreate from '../../components/market/OpenMarketCreate';

const OpenMarketCreatePage = () => <OpenMarketCreate />;

OpenMarketCreatePage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default OpenMarketCreatePage;

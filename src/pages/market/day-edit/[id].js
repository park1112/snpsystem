import Layout from '../../../layouts';
import DayEditPage from '../../../components/market/DayEditPage';


const MarketDayEditPage = () => <DayEditPage />;

MarketDayEditPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default MarketDayEditPage;

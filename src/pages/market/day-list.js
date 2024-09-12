import Layout from '../../layouts';
import DayListPage from '../../components/market/DayListPage';


const DayList = () => <DayListPage />;

DayList.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default DayList;

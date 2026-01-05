import Layout from '../../layouts';
import DailyReportPage from '../../components/market/DailyReportPage';


const DailyReport = () => <DailyReportPage />;

DailyReport.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default DailyReport;

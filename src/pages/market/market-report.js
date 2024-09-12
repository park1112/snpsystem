import Layout from '../../layouts';
import MarketAnalysisPage from '../../components/market/MarketAnalysisPage';


const MarketReportPage = () => <MarketAnalysisPage />;

MarketReportPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default MarketReportPage;

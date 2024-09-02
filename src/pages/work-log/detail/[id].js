import WorkLogDetail from '../../../components/work-log/WorkLogDetail';
import Layout from '../../../layouts';


const WorkLogDetailPage = () => {
    return <WorkLogDetail />;
};

WorkLogDetailPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WorkLogDetailPage;

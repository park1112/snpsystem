import WorkDashboard from '../../components/work-log/WorkDashboard';
import Layout from '../../layouts';


const WorkLogPage = () => {
    return <WorkDashboard />;
};

WorkLogPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WorkLogPage;

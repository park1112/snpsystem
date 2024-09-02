import EditLog from '../../../components/work-log/EditLog';
import Layout from '../../../layouts';


const WorkLogEditPage = () => {
    return <EditLog />;
};

WorkLogEditPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WorkLogEditPage;

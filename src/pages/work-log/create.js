import CreateLog from '../../components/work-log/CreateLog';
import Layout from '../../layouts';


const WorkCreateLogPage = () => {
    return <CreateLog />;
};

WorkCreateLogPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WorkCreateLogPage;

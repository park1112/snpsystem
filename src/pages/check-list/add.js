import ChecklistManagementPage from '../../components/check-list/ChecklistManagementPage';
import Layout from '../../layouts';

const CheckAddPage = () => <ChecklistManagementPage />;

CheckAddPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default CheckAddPage;
import ChecklistCategoryManagementPage from '../../components/check-list/ChecklistCategoryManagementPage';
import Layout from '../../layouts';

const CheckListCategoryPage = () => <ChecklistCategoryManagementPage />;

CheckListCategoryPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default CheckListCategoryPage;
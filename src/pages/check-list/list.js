import ChecklistResultsListPage from '../../components/check-list/ChecklistResultsListPage';
import Layout from '../../layouts';

const CheckListResultsPage = () => <ChecklistResultsListPage />;

CheckListResultsPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default CheckListResultsPage;
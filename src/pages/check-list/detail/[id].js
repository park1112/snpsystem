import Layout from '../../../layouts';
import ChecklistResultDetailPage from '../../../components/check-list/ChecklistResultDetailPage';


const CheckListDetailPage = () => <ChecklistResultDetailPage />;

CheckListDetailPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default CheckListDetailPage;

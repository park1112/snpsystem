
import Layout from '../../../layouts';
import Page from '../../../components/Page';
import UserTodoDetailPage from '../../../components/admin/UserTodoDetailPage';


const AdminTodoDetailPage = () => {
    return <UserTodoDetailPage />;
};

AdminTodoDetailPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AdminTodoDetailPage;

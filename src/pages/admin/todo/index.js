
import Layout from '../../../layouts';
import Page from '../../../components/Page';
import UserTodoListPage from '../../../components/admin/UserTodoListPage';


const AdminTodoListPage = () => {
    return <UserTodoListPage />;
};

AdminTodoListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AdminTodoListPage;

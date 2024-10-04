
import Layout from '../../../layouts';
import Page from '../../../components/Page';
import UserTodoListPage from '../../../components/admin/UserTodoListPage';
import ProtectedRoute from '../../../contexts/ProtectedRoute'; // ProtectedRoute 컴포넌트를 가져옵니다.



const AdminTodoListPage = () => (
        <ProtectedRoute requiredRole="admin">
            <UserTodoListPage />
        </ProtectedRoute>
    );

AdminTodoListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AdminTodoListPage;

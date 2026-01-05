
import Layout from '../../../layouts';
import Page from '../../../components/Page';
import UserTodoDetailPage from '../../../components/admin/UserTodoDetailPage';
import ProtectedRoute from '../../../contexts/ProtectedRoute'; // ProtectedRoute 컴포넌트를 가져옵니다.



const AdminTodoDetailPage = () => (
        <ProtectedRoute requiredRole="admin">
            <UserTodoDetailPage />
        </ProtectedRoute>
    );

AdminTodoDetailPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AdminTodoDetailPage;

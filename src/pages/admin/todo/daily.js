
import Layout from '../../../layouts';
import Page from '../../../components/Page';
import DailyTodoReportPage from '../../../components/admin/DailyTodoReportPage';
import ProtectedRoute from '../../../contexts/ProtectedRoute'; // ProtectedRoute 컴포넌트를 가져옵니다.



const AdminDailyReportPage = () => (
        <ProtectedRoute requiredRole="admin">
            <DailyTodoReportPage />
        </ProtectedRoute>
    );

AdminDailyReportPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AdminDailyReportPage;

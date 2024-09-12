
import Layout from '../../layouts';
import Page from '../../components/Page';
import AdminPage from '../../components/admin/AdminPage';
import ProtectedRoute from '../../contexts/ProtectedRoute'; // ProtectedRoute 컴포넌트를 가져옵니다.



const ProductListPage = () => (
        <ProtectedRoute requiredRole="admin">
            <AdminPage />
        </ProtectedRoute>
    );

ProductListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default ProductListPage;

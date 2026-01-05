import { useUser } from './UserContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user || (requiredRole && user.role !== requiredRole)) {
                // 권한이 없거나 유저가 없는 경우
                router.push('/login');
            }
        }
    }, [user, loading, router, requiredRole]);

    if (loading || !user || (requiredRole && user.role !== requiredRole)) {
        return <p>Loading...</p>; // 로딩 상태에서 아무것도 보여주지 않거나 로딩 메시지를 보여줌
    }

    return children; // 권한이 있는 경우에만 페이지를 렌더링
};

export default ProtectedRoute;

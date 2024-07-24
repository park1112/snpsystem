import { useRouter } from 'next/router';
import ProductDetail from '../components/ProductDetail';
import Layout from '../components/Layout';

export default function ProductDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <ProductDetail productId={id} />}
        </Layout>
    );
}

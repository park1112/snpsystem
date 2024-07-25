import { useRouter } from 'next/router';
import ProductDetail from '../../components/products/ProductDetail';
import Layout from '../../layouts';

export default function ProductDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {id && <ProductDetail productId={id} />}
        </Layout>
    );
}

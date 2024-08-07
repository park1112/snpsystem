import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ProductForm from '../../components/products/ProductForm';
import Layout from '../../layouts';
import { getKoreaTime } from '../../models/time'; // 한국 시간 유틸리티 함수 불러오기

const AddProductPage = () => {
    const router = useRouter();

    const handleAddProduct = async (productData) => {
        try {
            const now = getKoreaTime().toISOString(); // 한국 시간 사용
            await addDoc(collection(db, 'products'), {
                ...productData,
                createdAt: now,
                updatedAt: now,
            });

            alert('상품이 성공적으로 생성되었습니다.');
            router.push('/products');
        } catch (err) {
            console.error('Failed to create product:', err);
            alert('생성 실패: ' + err.message);
        }
    };

    return <ProductForm onSubmit={handleAddProduct} />;
};

AddProductPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddProductPage;

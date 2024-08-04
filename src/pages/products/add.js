import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ProductForm from '../../components/products/ProductForm';
import Layout from '../../layouts';
import Page from '../../components/Page';


const AddProductPage = () => {
    const router = useRouter();

    const handleAddProduct = async (productData) => {
        await addDoc(collection(db, 'products'), productData);
        router.push('/products');
    };

    return <ProductForm onSubmit={handleAddProduct} />;
};

AddProductPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddProductPage;
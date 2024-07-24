import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import { useEffect, useState } from 'react';
import ProductForm from '../../../components/products/ProductForm';
import Layout from '../../../layouts';
import Page from '../../../components/Page';
import { CircularProgress, Box } from '@mui/material';

const EditProductPage = () => {
    const [initialData, setInitialData] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const productRef = doc(db, 'products', id);
                const productDoc = await getDoc(productRef);
                if (productDoc.exists()) {
                    const productData = {
                        id,
                        ...productDoc.data()
                    };
                    console.log("Fetched Product Data:", productData); // Debugging log
                    setInitialData(productData);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            }
        };

        fetchProduct();
    }, [id]);

    const handleUpdateProduct = async (updatedData) => {
        try {
            const productRef = doc(db, 'products', id);
            await updateDoc(productRef, updatedData);
            router.push('/products');
        } catch (error) {
            console.error("Error updating document:", error);
        }
    };

    return initialData ? (
        <ProductForm initialData={initialData} onSubmit={handleUpdateProduct} />
    ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
        </Box>
    );
};

EditProductPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default EditProductPage;
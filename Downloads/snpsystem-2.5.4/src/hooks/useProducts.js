import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
        setLoading(false);
    };

    const addProduct = async (productData) => {
        await addDoc(collection(db, 'products'), productData);
        fetchProducts();
    };

    const updateProduct = async (id, updatedData) => {
        const productRef = doc(db, 'products', id);
        await updateDoc(productRef, updatedData);
        fetchProducts();
    };

    const deleteProduct = async (id) => {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct
    };
};

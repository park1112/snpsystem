import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import GenericList from '../common/GenericList';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchProducts = useCallback(async () => {
        console.log('fetchProducts called'); // 디버깅 로그
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'market_products'));
            const productsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : null,
            }));

            const sortedProductsData = productsData.sort((a, b) => {
                if (!a.deliveryProductName) return 1;
                if (!b.deliveryProductName) return -1;
                return a.deliveryProductName.localeCompare(b.deliveryProductName);
            });

            // console.log('Sorted data:', sortedProductsData);
            setProducts(sortedProductsData);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // console.log('useEffect running'); // 디버깅 로그
        let isMounted = true;

        const fetchData = async () => {
            if (isMounted) {
                await fetchProducts();
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [fetchProducts]);

    const handleDelete = useCallback(async (productId) => {
        if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
            try {
                await deleteDoc(doc(db, 'market_products', productId));
                setProducts(prevProducts => prevProducts.filter((product) => product.id !== productId));
                alert('상품이 성공적으로 삭제되었습니다.');
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    }, []);

    const handleEdit = useCallback((id) => {
        router.push(`/market/edit/${id}`);
    }, [router]);

    const handleRowClick = useCallback((id) => {
        router.push(`/market/product-detail/${id}`);
    }, [router]);

    const columns = useMemo(() => [
        { id: 'registeredProductName', label: '등록된 상품명' },
        { id: 'deliveryProductName', label: '택배 상품명' },
        { id: 'productPrice', label: '상품 가격', render: (item) => item.productPrice || 0 },
        { id: 'boxType', label: '박스타입' },
        { id: 'count', label: '설정수량', render: (item) => item.count || 0 },
        { id: 'margin', label: '마진', render: (item) => item.margin || 0 },
    ], []);

    console.log('Component rendered'); // 디버깅 로그

    return (
        <GenericList
            title="상품 리스트"
            items={products}
            columns={columns}
            onFetch={fetchProducts}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onRowClick={handleRowClick}
            addButtonText="상품추가"
            addButtonLink="/market/market-product-create"
            loading={loading}
        />
    );
};

export default React.memo(ProductListPage);
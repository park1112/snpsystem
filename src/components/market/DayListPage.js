import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import GenericList from '../common/GenericList';
import dayjs from 'dayjs';

const DayListPage = () => {
    const [inboundInventories, setInboundInventories] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchInboundInventories = useCallback(async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'daily_summaries'));
            const inboundData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date ? doc.data().date.toDate() : null,
            }));
            // 수신 데이터를 날짜별로 내림차순으로 정렬합니다.
            const sortedInboundData = inboundData.sort((a, b) => {
                if (!a.date) return 1;  // 날짜가 없는 항목은 마지막에 넣으세요
                if (!b.date) return -1; // 날짜가 없는 항목은 마지막에 넣으세요
                return b.date - a.date;
            });
            console.log(sortedInboundData);
            setInboundInventories(sortedInboundData);
        } catch (error) {
            console.error('Error fetching inbound inventories:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInboundInventories();
    }, [fetchInboundInventories]);

    const handleDelete = useCallback(async (inboundId) => {
        if (window.confirm("정말로 이 입고 기록을 삭제하시겠습니까?")) {
            try {
                await deleteDoc(doc(db, 'daily_summaries', inboundId));
                setInboundInventories(prevInbound => prevInbound.filter((inv) => inv.id !== inboundId));
                alert('입고 기록이 성공적으로 삭제되었습니다.');
            } catch (error) {
                console.error('Error deleting inbound inventory:', error);
            }
        }
    }, []);

    const handleEdit = useCallback((id) => {
        router.push(`/market/edit/${id}`);
    }, [router]);

    const handleRowClick = useCallback((id) => {
        router.push(`/market/detail/${id}`);
    }, [router]);

    const columns = useMemo(() => [
        { id: 'markets', label: '회원이름' },

        // { id: 'status', label: '상태' },
        // { id: 'itemCode', label: 'ItemCode' },
        // { id: 'productsCount', label: '상품 수', render: (item) => item.products ? item.products.length : 0 },
        // {
        //     id: 'productDetails',
        //     label: '상품 상세 내역',
        //     render: (item) => {
        //         if (!item.products || item.products.length === 0) return 'No products';
        //         const details = item.products.slice(0, 3).map((product, index) => (
        //             <div key={index} style={{ whiteSpace: 'pre-line' }}>
        //                 {`${product.productName}`}
        //             </div>
        //         ));
        //         if (item.products.length > 3) {
        //             details.push(<div key="more">...</div>);
        //         }
        //         return <div>{details}</div>;
        //     }
        // },
        { id: 'totalQuantity', label: '총 수량', render: (item) => item.totalQuantity || 0 },
        { id: 'totalPrice', label: '총 금액', render: (item) => item.totalPrice || 0 },
        // { id: 'note', label: '비고' },
        { id: 'date', label: '날짜', render: (item) => item.date ? dayjs(item.date).format('YYYY-MM-DD HH:mm') : 'N/A' },


    ], []);

    return (
        <GenericList
            title="오픈마켓 출고상품 목록"
            items={inboundInventories}
            columns={columns}
            onFetch={fetchInboundInventories}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onRowClick={handleRowClick}  // 새로 추가된 prop
            addButtonText="상품추가"
            addButtonLink="/market/market-product-create"
            loading={loading}
        />
    );
};

export default React.memo(DayListPage);
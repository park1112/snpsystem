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
                updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : null,
            }));

            // 날짜별 내림차순 정렬 (null 날짜는 맨 뒤로)
            const sortedInboundData = inboundData.sort((a, b) => {
                if (!a.updatedAt) return 1;
                if (!b.updatedAt) return -1;
                return b.updatedAt.getTime() - a.updatedAt.getTime();
            });

            // console.log('Sorted data:', sortedInboundData);
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
        { id: 'updatedAt', label: '업데이트 날짜', render: (item) => item.updatedAt ? dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm') : 'N/A' },
        { id: 'marketName', label: '회원이름' },
        { id: 'totalQuantity', label: '총 수량', render: (item) => item.totalQuantity || 0 },
        { id: 'totalPrice', label: '총 금액', render: (item) => item.totalPrice.toLocaleString() || 0 },
    ], []);

    return (
        <GenericList
            title="오픈마켓 출고상품 목록"
            items={inboundInventories}
            columns={columns}
            onFetch={fetchInboundInventories}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onRowClick={handleRowClick}
            addButtonText="상품추가"
            addButtonLink="/market/market-product-create"
            loading={loading}
        />
    );
};

export default React.memo(DayListPage);

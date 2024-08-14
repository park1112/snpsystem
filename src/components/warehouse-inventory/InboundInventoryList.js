import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import GenericList from '../common/GenericList';
import dayjs from 'dayjs';

const InboundInventoryList = () => {
    const [inboundInventories, setInboundInventories] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchInboundInventories = useCallback(async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'warehouse_inventory'));
            const inboundData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
            }));
            setInboundInventories(inboundData);
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
                await deleteDoc(doc(db, 'warehouse_inventory', inboundId));
                setInboundInventories(prevInbound => prevInbound.filter((inv) => inv.id !== inboundId));
                alert('입고 기록이 성공적으로 삭제되었습니다.');
            } catch (error) {
                console.error('Error deleting inbound inventory:', error);
            }
        }
    }, []);

    const handleEdit = useCallback((id) => {
        router.push(`/warehouse-inventory/${id}/edit`);
    }, [router]);

    const handleRowClick = useCallback((id) => {
        router.push(`/warehouse-inventory/${id}`);
    }, [router]);

    const columns = useMemo(() => [
        { id: 'warehouseName', label: '창고 이름' },
        { id: 'createdAt', label: '날짜', render: (item) => item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A' },
        { id: 'status', label: '상태' },
        { id: 'teamName', label: '작업팀' },
        { id: 'productsCount', label: '상품 수', render: (item) => item.products ? item.products.length : 0 },
        { id: 'note', label: '비고' },
    ], []);

    return (
        <GenericList
            title="입고 목록"
            items={inboundInventories}
            columns={columns}
            onFetch={fetchInboundInventories}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onRowClick={handleRowClick}  // 새로 추가된 prop
            addButtonText="입고 추가"
            addButtonLink="/warehouse-inventory/inbound"
            loading={loading}
        />
    );
};

export default React.memo(InboundInventoryList);
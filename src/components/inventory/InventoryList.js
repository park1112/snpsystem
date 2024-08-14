import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import GenericList from '../common/GenericList';
import { getKoreanStatus } from '../CommonStatus';
import { deleteInventoryTransaction } from '../../services/inventoryService';
import dayjs from 'dayjs';

const InventoryList = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchInventories = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'inventories'));
      const inventoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
      }));
      setInventories(inventoriesData);
    } catch (error) {
      console.error('Error fetching inventories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  const handleDelete = useCallback(async (inventoryId) => {
    if (window.confirm("정말로 이 인벤토리와 관련된 모든 데이터를 삭제하시겠습니까?")) {
      try {
        await deleteInventoryTransaction(inventoryId);
        setInventories(prevInventories => prevInventories.filter((inv) => inv.id !== inventoryId));
        alert('인벤토리와 물류기기 상태가 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('Error deleting inventory:', error);
      }
    }
  }, []);

  const handleEdit = useCallback((id) => {
    router.push(`/inventory/${id}/edit`);
  }, [router]);

  const columns = useMemo(() => [
    { id: 'warehouseName', label: 'Warehouse' },
    { id: 'productName', label: '상품이름', render: (item) => item.products?.map(p => p.productName).join(', ') || 'N/A' },
    { id: 'quantity', label: '수량', render: (item) => item.products?.map(p => p.quantity).join(', ') || 'N/A' },
    { id: 'status', label: '상태', render: (item) => getKoreanStatus(item.status) || 'N/A' },
    { id: 'logistics', label: '물류기기', render: (item) => item.logistics?.map(l => l.name).join(', ') || 'N/A' },
    { id: 'logisticsQuantity', label: '수량', render: (item) => item.logistics?.map(l => l.unit).join(', ') || 'N/A' },
    { id: 'createdAt', label: '생성 날짜', render: (item) => item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A' },
  ], []);

  return (
    <GenericList
      title="Inventories"
      items={inventories}
      columns={columns}
      onFetch={fetchInventories}
      onDelete={handleDelete}
      onEdit={handleEdit}
      addButtonText="Add Inventory"
      addButtonLink="/inventory/select"
      loading={loading}
    />
  );
};

export default React.memo(InventoryList);
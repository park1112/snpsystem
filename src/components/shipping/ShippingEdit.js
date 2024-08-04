import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ShippingForm from './ShippingForm'; // ShippingForm 컴포넌트를 재사용

const ShippingEdit = () => {
    const router = useRouter();
    const { id } = router.query; // URL 파라미터에서 출고 ID 가져오기
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shippingData, setShippingData] = useState(null);

    useEffect(() => {
        const fetchShippingData = async () => {
            if (id) {
                try {
                    const docRef = doc(db, 'shipping', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setShippingData(docSnap.data());
                        setLoading(false);
                    } else {
                        console.log('No such document!');
                        setError('출고 정보를 찾을 수 없습니다.');
                        setLoading(false);
                    }
                } catch (error) {
                    console.error('Error fetching shipping data:', error);
                    setError('출고 정보를 불러오는 중 오류가 발생했습니다.');
                    setLoading(false);
                }
            }
        };

        fetchShippingData();
    }, [id]);

    const handleSubmit = async (updatedData) => {
        try {
            const docRef = doc(db, 'shipping', id);
            await updateDoc(docRef, updatedData);
            alert('출고 정보가 성공적으로 수정되었습니다.');
            router.push('/shipping'); // 수정 후 목록 페이지로 이동
        } catch (error) {
            console.error('Error updating shipping data:', error);
            setError('출고 정보를 수정하는 중 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h2>출고 정보 수정</h2>
            <ShippingForm initialData={shippingData} onSubmit={handleSubmit} />
        </div>
    );
};

export default ShippingEdit;

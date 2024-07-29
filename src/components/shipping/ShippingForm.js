import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { collection, getDocs, doc, runTransaction, serverTimestamp, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import InventorySelector from './InventorySelector';
import ShippingSummary from './ShippingSummary';
import TransportForm from './TransportForm';

const ShippingForm = () => {
    const router = useRouter();
    const [inventoryDocs, setInventoryDocs] = useState({});
    const { partnerId, partnerName, lastShippingDate, lastPalletQuantity, lastTotalQuantity } = router.query;

    const [partnerInfo, setPartnerInfo] = useState({
        id: partnerId,
        name: partnerName,
        lastShippingDate: lastShippingDate || '',
        lastPalletQuantity: parseInt(lastPalletQuantity) || 0,
        lastTotalQuantity: parseInt(lastTotalQuantity) || 0,
    });

    const [selectedItems, setSelectedItems] = useState([]);
    const [shippingInfo, setShippingInfo] = useState({
        shippingDate: new Date().toISOString().split('T')[0],
        note: '',
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false); // 중복 버튼 입력 방지
    const [error, setError] = useState(null); // 에러 상태 관리
    const [warehouseProducts, setWarehouseProducts] = useState([]);
    const [transportInfo, setTransportInfo] = useState({
        vehicleNumber: '',
        name: '',
        phone: '',
        transportFee: '',
        paymentResponsible: '',
    });

    const [isNewDriver, setIsNewDriver] = useState(false); // 새로운 기사 등록 여부
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

    useEffect(() => {
        const fetchWarehouseProducts = async () => {
            if (router.isReady) {
                setPartnerInfo({
                    id: partnerId,
                    name: partnerName,
                    lastShippingDate: lastShippingDate || '',
                    lastPalletQuantity: parseInt(lastPalletQuantity) || 0,
                    lastTotalQuantity: parseInt(lastTotalQuantity) || 0,
                });

                try {
                    const warehousesSnapshot = await getDocs(collection(db, 'warehouses'));
                    let products = [];
                    let inventoryDocsData = {};
                    for (const warehouseDoc of warehousesSnapshot.docs) {
                        const warehouseData = warehouseDoc.data();
                        if (warehouseData && warehouseData.statuses) {
                            for (const [status, statusData] of Object.entries(warehouseData.statuses)) {
                                if (statusData && statusData.products) {
                                    for (const [productId, productData] of Object.entries(statusData.products)) {
                                        if (productData) {
                                            products.push({
                                                warehouseId: warehouseDoc.id,
                                                warehouseName: warehouseData.name || 'Unknown Warehouse',
                                                status,
                                                productId,
                                                productName: productData.name || 'Unknown Product',
                                                count: productData.count || 0,
                                                inventoryUids: productData.inventoryUids || [],
                                            });

                                            // 인벤토리 문서 가져오기
                                            for (const inventoryId of productData.inventoryUids) {
                                                const inventoryDoc = await getDoc(doc(db, 'inventory', inventoryId));
                                                if (inventoryDoc.exists()) {
                                                    inventoryDocsData[inventoryId] = inventoryDoc.data();
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    setWarehouseProducts(products);
                    setInventoryDocs(inventoryDocsData);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching warehouse products:', error);
                    setError('창고 데이터를 가져오는 중 오류가 발생했습니다.');
                    setLoading(false);
                }
            }
        };

        fetchWarehouseProducts();
    }, [router.isReady, partnerId, partnerName, lastShippingDate, lastPalletQuantity, lastTotalQuantity]);

    const handleItemSelect = (item, quantity) => {
        const inventoryDoc = inventoryDocs[item.inventoryUids[0]];
        const newItem = {
            ...item,
            quantity,
            count: quantity * (inventoryDoc?.quantity || 1),
        };

        const existingItemIndex = selectedItems.findIndex(i => i.productId === item.productId);
        if (existingItemIndex > -1) {
            const updatedItems = [...selectedItems];
            updatedItems[existingItemIndex] = newItem;
            setSelectedItems(updatedItems);
        } else {
            setSelectedItems([...selectedItems, newItem]);
        }
    };
    const handleRemoveItem = (index) => {
        const updatedItems = [...selectedItems];
        updatedItems.splice(index, 1);
        setSelectedItems(updatedItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return; // 중복 제출 방지
        setSubmitting(true); // 제출 시작
        setError(null); // 기존 에러 상태 초기화

        try {
            // 모든 읽기 작업을 먼저 수행
            const warehouseRefs = {};
            const inventoryRefs = {};
            const warehouseDocs = {};
            const inventoryDocs = {};

            for (const item of selectedItems) {
                if (!warehouseRefs[item.warehouseId]) {
                    warehouseRefs[item.warehouseId] = doc(db, 'warehouses', item.warehouseId);
                    const warehouseDoc = await getDoc(warehouseRefs[item.warehouseId]);
                    if (!warehouseDoc.exists()) {
                        throw new Error(`Warehouse ${item.warehouseId} does not exist`);
                    }
                    warehouseDocs[item.warehouseId] = warehouseDoc.data();
                }

                if (!warehouseDocs[item.warehouseId].statuses) {
                    warehouseDocs[item.warehouseId].statuses = {};
                }
                if (!warehouseDocs[item.warehouseId].statuses[item.status]) {
                    warehouseDocs[item.warehouseId].statuses[item.status] = { products: {} };
                }
                if (!warehouseDocs[item.warehouseId].statuses[item.status].products[item.productId]) {
                    warehouseDocs[item.warehouseId].statuses[item.status].products[item.productId] = {
                        count: 0,
                        inventoryUids: []
                    };
                }

                const currentProduct = warehouseDocs[item.warehouseId].statuses[item.status].products[item.productId];
                if (currentProduct && currentProduct.inventoryUids) {
                    for (const inventoryId of currentProduct.inventoryUids) {
                        if (!inventoryRefs[inventoryId]) {
                            inventoryRefs[inventoryId] = doc(db, 'inventory', inventoryId);
                            const inventoryDoc = await getDoc(inventoryRefs[inventoryId]);
                            if (inventoryDoc.exists()) {
                                inventoryDocs[inventoryId] = inventoryDoc.data();
                            }
                        }
                    }
                }
            }

            await runTransaction(db, async (transaction) => {
                // 판매 컬렉션에 새 문서 생성
                const shippingRef = doc(collection(db, 'shipping'));
                const shippingData = {
                    partnerId: partnerInfo.id,
                    partnerName: partnerInfo.name,
                    items: [],
                    ...shippingInfo,
                    createdAt: serverTimestamp(),
                    transportInfo: {
                        vehicleNumber: transportInfo.vehicleNumber,
                        name: transportInfo.name,
                        phone: transportInfo.phone,
                        transportFee: transportInfo.transportFee,
                        paymentResponsible: transportInfo.paymentResponsible,
                        accountNumber: accountNumber,
                        accountHolder: accountHolder,
                    },
                    warehouseName: '', // 여기서 warehouseName 필드를 추가합니다.
                };

                // 인벤토리 및 창고 상태 업데이트
                for (const item of selectedItems) {
                    const warehouseData = warehouseDocs[item.warehouseId];
                    const currentProduct = warehouseData.statuses[item.status].products[item.productId];

                    if (currentProduct) {
                        const inventoryDoc = inventoryDocs[currentProduct.inventoryUids[0]];
                        const totalCount = item.quantity * (inventoryDoc?.quantity || 1);
                        currentProduct.count -= totalCount;

                        // 인벤토리 문서 업데이트 및 inventoryUids에서 삭제
                        const shippedInventoryUids = [];
                        for (let i = 0; i < item.quantity; i++) {
                            const inventoryId = currentProduct.inventoryUids[i];
                            if (inventoryId && inventoryRefs[inventoryId]) {
                                transaction.update(inventoryRefs[inventoryId], {
                                    status: 'shipped',
                                    partnerId: partnerInfo.id,
                                    shippingDate: shippingInfo.shippingDate,
                                });
                                shippedInventoryUids.push(inventoryId);
                            }
                        }
                        currentProduct.inventoryUids = currentProduct.inventoryUids.slice(item.quantity);

                        // 창고 문서 업데이트
                        if (currentProduct.count <= 0) {
                            delete warehouseData.statuses[item.status].products[item.productId];
                        } else {
                            warehouseData.statuses[item.status].products[item.productId] = currentProduct;
                        }
                        transaction.update(warehouseRefs[item.warehouseId], { statuses: warehouseData.statuses });

                        // 출고 문서에 항목 추가
                        shippingData.items.push({
                            ...item,
                            count: totalCount,
                            inventoryUids: shippedInventoryUids,
                        });
                    }
                    // 첫 번째 항목의 창고 이름을 설정합니다.
                    if (!shippingData.warehouseName) {
                        shippingData.warehouseName = warehouseData.name || 'Unknown Warehouse';
                    }
                }

                // 출고 문서 생성
                transaction.set(shippingRef, shippingData);

                // 거래처 업데이트
                const partnerRef = doc(db, 'partners', partnerInfo.id);
                const currentDate = new Date(); // 현재 시간을 사용
                const shippingHistoryEntry = {
                    shippingId: shippingRef.id,
                    date: currentDate, // serverTimestamp() 대신 현재 시간 사용
                    shippingDate: shippingInfo.shippingDate,
                    totalQuantity: shippingData.items.reduce((sum, item) => sum + item.count, 0),
                    palletQuantity: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
                    note: shippingInfo.note || '',
                };
                transaction.update(partnerRef, {
                    lastShippingDate: shippingInfo.shippingDate,
                    lastPalletQuantity: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
                    lastTotalQuantity: shippingData.items.reduce((sum, item) => sum + item.count, 0),
                    shippingHistory: arrayUnion(shippingHistoryEntry),
                });

                // 운송 기록 추가
                const transportRecord = {
                    partnerId: partnerInfo.id,
                    createdAt: currentDate,
                };
                transaction.update(partnerRef, {
                    transportRecords: arrayUnion(transportRecord),
                });
            });


            alert('판매 출고가 성공적으로 등록되었습니다.');
            router.push('/shipping');
        } catch (error) {
            console.error('Error in shipping transaction:', error);
            console.log('Transaction failed with error:', error);
            setError('판매 출고 등록 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false); // 제출 종료
        }
    };


    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box mt={5}>
            <Typography variant="h4" gutterBottom>
                {partnerInfo.name} 판매 출고
            </Typography>
            <Typography variant="body1" gutterBottom>
                마지막 출고일: {partnerInfo.lastShippingDate || '없음'}
            </Typography>
            <Typography variant="body1" gutterBottom>
                마지막 출고 바렛트 수량: {partnerInfo.lastPalletQuantity}
            </Typography>
            <Typography variant="body1" gutterBottom>
                마지막 출고 총 수량: {partnerInfo.lastTotalQuantity}
            </Typography>

            {error && (
                <Typography variant="body1" color="error" gutterBottom>
                    {error}
                </Typography>
            )}

            <form onSubmit={handleSubmit}>
                <TextField
                    label="출고일"
                    type="date"
                    value={shippingInfo.shippingDate}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, shippingDate: e.target.value })}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="비고"
                    value={shippingInfo.note}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, note: e.target.value })}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                />

                <InventorySelector products={warehouseProducts} onSelect={handleItemSelect} />
                <ShippingSummary items={selectedItems} inventoryDocs={inventoryDocs} onRemove={handleRemoveItem} />

                <TransportForm
                    transportInfo={transportInfo}
                    setTransportInfo={setTransportInfo}
                    isNewDriver={isNewDriver} // 수정
                    setIsNewDriver={setIsNewDriver}
                    accountNumber={accountNumber}
                    setAccountNumber={setAccountNumber}
                    accountHolder={accountHolder}
                    setAccountHolder={setAccountHolder}
                />


                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    disabled={submitting || selectedItems.length === 0} // 중복 제출 방지 및 선택된 상품 없을 때 비활성화
                >
                    판매 출고 등록
                </Button>
            </form>
        </Box>
    );
};

export default ShippingForm;

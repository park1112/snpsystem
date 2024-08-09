import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress, TextField, Button, Grid, Container } from '@mui/material';
import { fetchProducts, submitInventoryTransaction, fetchLogisticsByProductUid } from '../../services/inventoryService';
import ReusableButton from '../ReusableButton';
import InventoryLogs from './InventoryLogs';
import { getKoreanStatus } from '../../utils/inventoryStatus';
import DeleteInventoryItem from './DeleteInventoryItem';
import { updateWarehouseInventory, updateOrDeleteMovement, updateMovement } from '../WarehouseInventoryManager';
import { Timestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const InventoryFormStep2 = ({ initialData, onSubmit }) => {
  const [formState, setFormState] = useState({
    subCategory: '',
    productWeight: '',
    productType: '',
    productName: '',
    quantity: '',
    productUid: '',
    createdAt: '',
    updatedAt: '',
    status: initialData.status,
    teamUid: initialData.teamUid,
    teamName: initialData.teamName,
    products: [], // Added products list
    warehouseUid: initialData.warehouseUid, // 초기 데이터에서 가져온 창고 UID
    warehouseName: initialData.warehouseName,
  });
  const [products, setProducts] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);  // 추가된 상품들을 저장하는 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [filteredWeights, setFilteredWeights] = useState([]);
  const [logs, setLogs] = useState([]);
  const isSubmitting = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormState((prev) => ({
        ...prev,
        ...initialData,
        status: initialData.status || 'production',
        warehouseUid: initialData.warehouseUId || initialData.warehouseUid,
        warehouseName: initialData.warehouseName,
        teamUid: initialData.teamUid,
        teamName: initialData.teamName,
      }));
    }
  }, [initialData]);

  useEffect(() => {
    if (formState.productUid) {
      const loadLogistics = async () => {
        try {
          const logisticsData = await fetchLogisticsByProductUid(formState.productUid);
          setFormState(prev => ({
            ...prev,
            logistics: logisticsData
          }));
        } catch (error) {
          console.error('Error fetching logistics:', error);
          setError('Failed to load logistics data');
        }
      };

      loadLogistics();
    }
  }, [formState.productUid]);

  useEffect(() => {
    if (formState.subCategory) {
      const selectedSubCategoryProducts = products.filter((product) => product.subCategory === formState.subCategory);
      const weights = [...new Set(selectedSubCategoryProducts.map((product) => product.weight.replace('kg', '')))];
      setFilteredWeights(weights);
      setFilteredTypes([]);
      setFormState((prev) => ({ ...prev, productWeight: '', productType: '', quantity: '' }));
    } else {
      setFilteredWeights([]);
      setFilteredTypes([]);
    }
  }, [formState.subCategory, products]);

  useEffect(() => {
    if (formState.productWeight) {
      const selectedWeightProducts = products.filter(
        (product) =>
          product.subCategory === formState.subCategory && product.weight.replace('kg', '') === formState.productWeight
      );
      const types = [...new Set(selectedWeightProducts.map((product) => product.typeName))];
      setFilteredTypes(types);
      setFormState((prev) => ({ ...prev, productType: '', quantity: '' }));
    } else {
      setFilteredTypes([]);
    }
  }, [formState.productWeight, formState.subCategory, products]);

  useEffect(() => {
    if (formState.subCategory && formState.productWeight && formState.productType) {
      const selectedProduct = products.find(
        (product) =>
          product.subCategory === formState.subCategory &&
          product.weight.replace('kg', '') === formState.productWeight &&
          product.typeName === formState.productType
      );
      if (selectedProduct) {
        setFormState((prevState) => ({
          ...prevState,
          quantity: selectedProduct.quantity.toString(),
          productName: selectedProduct.name,
          productUid: selectedProduct.uid,
        }));
      }
    }
  }, [formState.subCategory, formState.productWeight, formState.productType, products]);

  const isSubmitDisabled = useMemo(() => {
    return !formState.subCategory || !formState.productWeight || !formState.productType || !formState.quantity;
  }, [formState.subCategory, formState.productWeight, formState.productType, formState.quantity]);

  const handleSelect = (name, value) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleQuantityChange = (value) => {
    setFormState((prevState) => ({
      ...prevState,
      quantity: value.toString(),
    }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmitting.current) return;

      isSubmitting.current = true;

      // 현재 선택된 제품을 products 배열에 추가
      let updatedProducts = [...formState.products];
      if (formState.productUid && formState.productName && formState.quantity) {
        updatedProducts.push({
          productUid: formState.productUid,
          productName: formState.productName,
          quantity: formState.quantity,
        });
      }

      const invalidProduct = updatedProducts.some(
        (product) =>
          !product.productUid || !product.productName || !product.quantity
      );

      if (invalidProduct) {
        alert('상품 정보를 올바르게 입력해 주세요.');
        isSubmitting.current = false;
        return;
      }

      try {
        console.log("인벤토리 아이템 생성 시작");

        // 인벤토리 아이템 생성
        const inventoryUid = await submitInventoryTransaction({ ...formState, products: updatedProducts }, initialData, setLogs);

        if (!inventoryUid) {
          throw new Error('inventoryUid 생성에 실패했습니다.');
        }

        console.log("인벤토리 아이템 생성 완료, inventoryUid:", inventoryUid);

        // logistics_movements에 새 필드 추가 및 warehouses 업데이트
        const logisticsItems = await Promise.all(
          formState.logistics.map(async (logistic) => {
            const newMovement = {
              warehouseUid: formState.warehouseUid,
              inventory_uid: inventoryUid,
              logistics_uid: logistic.uid,
              logistics_name: logistic.name,
              quantity: logistic.multiply ? Number(formState.quantity) : logistic.unit,
              state: 'reserved', // 물류기기의 상태를 인벤토리 상태로 설정
              date: Timestamp.fromDate(new Date()),
            };

            // logistics_movements에 새로운 문서 생성
            const docRef = await addDoc(collection(db, 'logistics_movements'), {
              ...newMovement,
              date: Timestamp.fromDate(new Date()),
            });

            console.log("logistics_movements에 문서 생성 완료", docRef.id);

            return {
              logisticsItemId: logistic.uid, // 물류기기 UID
              logisticsItemName: logistic.name, // 물류기기 이름
              quantity: logistic.multiply ? Number(formState.quantity) : logistic.unit,
              movementType: 'reserved',
              movementId: docRef.id,
            };
          })
        );

        // warehouses에 물류기기 상태 업데이트
        await updateWarehouseInventory(formState.warehouseUid, logisticsItems);

        console.log("창고 업데이트 완료");

        // 폼 상태 초기화
        setFormState({
          subCategory: '',
          productWeight: '',
          productType: '',
          productName: '',
          quantity: '',
          productUid: '',
          createdAt: '',
          updatedAt: '',
          status: initialData.status,
          products: [], // 추가된 상품 초기화
          warehouseUid: initialData.warehouseUid,
          warehouseName: initialData.warehouseName,
        });

        alert('인벤토리와 물류기기 상태가 성공적으로 기록되었습니다.');
      } catch (error) {
        console.error('Error adding inventory:', error);
      } finally {
        isSubmitting.current = false;
      }
    },
    [formState, initialData]
  );


  const addProductToInventory = () => {
    if (!formState.productUid || !formState.productName || !formState.quantity) {
      alert('모든 상품 정보를 입력해 주세요.');
      return;
    }

    setFormState((prevState) => ({
      ...prevState,
      products: [
        ...(prevState.products || []), // `products`가 undefined일 경우 빈 배열로 초기화
        {
          productUid: prevState.productUid,
          productName: prevState.productName,
          quantity: prevState.quantity,
        },
      ],
      subCategory: '',
      productWeight: '',
      productType: '',
      productName: '',
      quantity: '',
      productUid: '',
    }));
  };



  const handleDeleteLog = (deletedId) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== deletedId));
  };

  // 상품 삭제 핸들러
  const handleDeleteProduct = (index) => {
    setFormState((prevState) => ({
      ...prevState,
      products: prevState.products.filter((_, i) => i !== index),
    }));
  };



  const handleLogisticsChange = (index, key, value) => {
    setFormState(prev => {
      const updatedLogistics = [...prev.logistics];
      updatedLogistics[index][key] = value;
      return {
        ...prev,
        logistics: updatedLogistics
      };
    });
  };



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
        <Typography variant="h4" gutterBottom>
          Add Inventory
        </Typography>

        <Box mt={2} width="100%">
          <Typography variant="h6">Selected Warehouse: {initialData.warehouseName}</Typography>
          <Typography variant="h6">Selected Status: {getKoreanStatus(initialData.status)}</Typography>
          <Typography variant="h6">Selected Work Team: {initialData.teamName}</Typography>
        </Box>

        <Typography variant="h6" mt={2}>
          Select Product SubCategory
        </Typography>
        <ReusableButton
          label="Select Product SubCategory"
          options={[...new Set(products.map((product) => product.subCategory))]}
          onSelect={(option) => handleSelect('subCategory', option)}
          fullWidth
        />

        {formState.subCategory && (
          <>
            <Typography variant="h6" mt={2}>
              Select Product Weight
            </Typography>
            <ReusableButton
              label="Select Product Weight"
              options={filteredWeights}
              onSelect={(option) => handleSelect('productWeight', option)}
              fullWidth
            />
          </>
        )}

        {formState.productWeight && (
          <>
            <Typography variant="h6" mt={2}>
              Select Product Type
            </Typography>
            <ReusableButton
              label="Select Product Type"
              options={filteredTypes}
              onSelect={(option) => handleSelect('productType', option)}
              fullWidth
            />
          </>
        )}

        <Grid container spacing={2} mt={2} justifyContent="center">
          <Grid item xs={4}>
            <Button variant="contained" type="button" onClick={() => handleQuantityChange(50)} fullWidth>
              50
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button variant="contained" type="button" onClick={() => handleQuantityChange(75)} fullWidth>
              75
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button variant="contained" type="button" onClick={() => handleQuantityChange(85)} fullWidth>
              85
            </Button>
          </Grid>
        </Grid>

        <TextField
          label="Quantity"
          name="quantity"
          value={formState.quantity}
          onChange={(e) => handleSelect('quantity', e.target.value)}
          margin="normal"
          fullWidth
          type="number"
        />


        {/* 물류기기 정보 입력 필드 */}
        <Typography variant="h6" mt={2}>
          Logistics Information
        </Typography>
        {(formState.logistics || []).map((logistic, index) => (
          <Box key={index} mb={2}>
            <Grid container spacing={2} mt={2} justifyContent="center">
              <Grid item xs={8}>
                <TextField
                  label="Logistics Name"
                  value={logistic.name}
                  onChange={(e) => handleLogisticsChange(index, 'name', e.target.value)}
                  margin="normal"
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Logistics Unit"
                  value={logistic.multiply ? formState.quantity : logistic.unit}
                  onChange={(e) => handleLogisticsChange(index, 'unit', e.target.value)}
                  margin="normal"
                  fullWidth
                  disabled={logistic.multiply} // multiply가 true면 입력 비활성화
                />
              </Grid>
            </Grid>
          </Box>
        ))}

        {/* 버튼 생성 필드 */}
        <Grid container spacing={2} mt={2} justifyContent="center">
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={addProductToInventory} // 추가 버튼 클릭 시 호출
              sx={{ mt: 3, mb: 2, py: 2, fontSize: '1.2rem' }}
              disabled={isSubmitDisabled}
              fullWidth
            >
              추가
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSubmit} // 등록 버튼 클릭 시 호출
              sx={{ mt: 3, mb: 2, py: 2, fontSize: '1.2rem' }}
              disabled={isSubmitting.current} // 등록 버튼은 항상 활성화
              fullWidth
            >
              등록
            </Button>
          </Grid>
        </Grid>



        {/* Added Products 섹션 */}
        {formState.products.length > 0 && (
          <Box mt={4} width="100%">
            <Typography variant="h6" gutterBottom>
              Added Products
            </Typography>
            {formState.products.map((product, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                mb={2}
                border="1px solid #ccc"
                borderRadius="4px"
              >
                <Typography>
                  {product.productName} - {product.quantity}kg
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDeleteProduct(index)}
                >
                  삭제
                </Button>
              </Box>
            ))}
          </Box>
        )}
        {/* Added Products 섹션 끝 */}


        <Box mt={4} width="100%">
          <InventoryLogs logs={logs} onDelete={handleDeleteLog} DeleteComponent={DeleteInventoryItem} />
        </Box>
      </Box >
    </Container >
  );
};

export default InventoryFormStep2;

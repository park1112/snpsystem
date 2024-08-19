import React, { useState, useEffect, useRef, useMemo, useCallback, } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress, TextField, Button, Grid, Container } from '@mui/material';
import { fetchProducts, submitInventoryTransaction, fetchLogisticsByProductUid, deleteInventoryTransaction, updateInventoryTransaction } from '../../services/inventoryService';
import ReusableButton from '../ReusableButton';
import InventoryLogs from './InventoryLogs';
import { getKoreanStatus } from '../../utils/inventoryStatus';

import { updateWarehouseInventory, updateOrDeleteMovement, updateWarehouseInventoryForDeletion, editWarehouseInventory } from '../WarehouseInventoryManager';
import { Timestamp, collection, addDoc, update } from 'firebase/firestore';
import { db, storage } from '../../utils/firebase';
import UploadMultiFile from '../upload-multi-file/UploadMultiFile';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';



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
    images: [],
  });
  const router = useRouter();
  const [inventoryId, setInventoryId] = useState(null);
  const logisticsInit = useRef(null); // 기존 물류기기 데이터를 저장하기 위한 useRef


  const [products, setProducts] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);  // 추가된 상품들을 저장하는 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [filteredWeights, setFilteredWeights] = useState([]);
  const [logs, setLogs] = useState([]);
  const isSubmitting = useRef(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [files, setFiles] = useState([]);

  const handleRemove = (file) => {
    setFiles(files.filter((f) => f !== file));
  };

  const handleRemoveAll = () => {
    setFiles([]);
  };



  useEffect(() => {
    // URL 쿼리 또는 경로에 ID가 있으면 수정 모드로 설정
    if (router.query.id) {
      setInventoryId(router.query.id);
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [router.query.id]);


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
      // 최초 로딩 시 초기 물류기기 데이터를 logisticsInit에 저장
      if (!logisticsInit.current) {
        logisticsInit.current = initialData.logistics || [];
        console.log('logisticsInit', logisticsInit)
      }
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
          quantity: Number(selectedProduct.quantity),
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
      quantity: Number(value),
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

      console.log('updatedProducts', updatedProducts);
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
        // 인벤토리 UID가 존재하지 않으면 새로운 UID 생성 (예: 신규 등록 시)
        const inventoryUid = inventoryId || 'inventory_' + uuidv4();
        console.log('Files before upload:', files); // 상태가 업데이트되었는지 확인
        const imageUrls = await uploadFilesAndGetURLs(files, inventoryUid);
        console.log('imageUrls', imageUrls)

        // 2. 업로드된 이미지 URL을 formState에 추가하여 최종 상태 생성
        const updatedLogistics = formState.logistics.map((logistic) => {
          if (logistic.multiply) {
            let totalQuantity = 0;
            updatedProducts.forEach(product => {
              totalQuantity += Number(product.quantity);
            });
            return { ...logistic, unit: totalQuantity };
          }
          return logistic;
        });


        // 수정된 logistics를 포함한 새로운 formState 생성
        const updatedFormState = {
          ...formState,
          products: updatedProducts,
          logistics: updatedLogistics,
          images: imageUrls.length > 0 ? imageUrls : [], // 이미지 URL 배열이 있을 경우에만 추가
        };

        // undefined 값 제거
        const sanitizedFormState = removeUndefinedFields(updatedFormState);


        console.log("인벤토리 아이템 생성 완료, updatedFormState:", updatedFormState);

        const newInventoryUid = await submitInventoryTransaction(sanitizedFormState, initialData, setLogs);

        if (!newInventoryUid) {
          throw new Error('inventoryUid 생성에 실패했습니다.');
        }


        // logistics_movements에 새 필드 추가 및 warehouses 업데이트
        const logisticsItems = await Promise.all(
          updatedFormState.logistics.map(async (logistic) => {


            const newMovement = {
              warehouseUid: formState.warehouseUid,
              inventory_uid: newInventoryUid,
              logistics_uid: logistic.uid,
              logistics_name: logistic.name,
              quantity: logistic.unit,
              state: 'stock', // 물류기기의 상태를 인벤토리 상태로 설정
              date: Timestamp.fromDate(new Date()),
            };

            // logistics_movements에 새로운 문서 생성
            console.log('newMovement', newMovement)
            const docRef = await addDoc(collection(db, 'logistics_movements'), {
              ...newMovement,
              date: Timestamp.fromDate(new Date()),
              action_type: 'create',
            });

            console.log("logistics_movements에 문서 생성 완료", docRef.id);

            return {
              logisticsItemId: logistic.uid, // 물류기기 UID
              logisticsItemName: logistic.name, // 물류기기 이름
              quantity: logistic.unit,
              movementType: 'stock',
              movementId: docRef.id,
              inventoryId: newInventoryUid,
            };
          })
        );



        // // warehouses에 기존 물류기기 삭제 
        // await updateOrDeleteMovement(formState.warehouseUid, editMovement.logistics_uid, oldMovement, null);

        // warehouses에 물류기기 상태 업데이트
        console.log('logisticsItems', logisticsItems)
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
        handleRemoveAll()

        alert('인벤토리와 물류기기 상태가 성공적으로 기록되었습니다.');
      } catch (error) {
        console.error('Error adding inventory:', error);
      } finally {
        isSubmitting.current = false;
      }
    },
    [formState, initialData, files, inventoryId]
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
          quantity: Number(prevState.quantity),
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

  const handleUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmitting.current) return;

      isSubmitting.current = true;
      if (!inventoryId) {
        console.error('Inventory ID가 유효하지 않습니다.');
        isSubmitting.current = false;
        return;
      }


      // 현재 선택된 제품을 products 배열에 추가
      console.log('formState.products', formState.products);
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
        console.log("인벤토리 아이템 수정 시작");
        console.log("updatedProducts", updatedProducts);
        const inventoryUid = inventoryId
        console.log('Files before upload:', files); // 상태가 업데이트되었는지 확인
        const imageUrls = await uploadFilesAndGetURLs(files, inventoryUid);
        console.log('imageUrls', imageUrls)

        // 물류 기기 수량 미리 계산

        const updatedLogistics = formState.logistics.map((logistic) => {
          if (logistic.multiply) {
            let totalQuantity = 0;
            updatedProducts.forEach(product => {
              totalQuantity += Number(product.quantity);
            });
            return { ...logistic, unit: totalQuantity };
          }
          return logistic;
        });

        // 수정된 logistics를 포함한 새로운 formState 생성
        const updatedFormState = {
          ...formState,
          products: updatedProducts,
          logistics: updatedLogistics,
          images: imageUrls.length > 0 ? imageUrls : [], // 이미지 URL 배열이 있을 경우에만 추가
        };



        console.log("updatedFormState", updatedFormState);

        // `initialData.id`를 사용하여 기존 인벤토리 항목 업데이트
        await updateInventoryTransaction(inventoryId, updatedFormState, setLogs);

        console.log("인벤토리 아이템 수정 완료");

        const logisticsItems = await Promise.all(
          updatedFormState.logistics.map(async (logistic) => {
            console.log(`Processing logistic item: ${logistic.uid}, Total Quantity: ${logistic.unit}`);

            const newMovement = {
              warehouseUid: formState.warehouseUid,
              inventory_uid: inventoryId, // 수정 시 기존 인벤토리 ID 사용
              logistics_uid: logistic.uid,
              logistics_name: logistic.name,
              quantity: logistic.unit,
              state: 'stock', // 물류기기의 상태를 인벤토리 상태로 설정
              date: Timestamp.fromDate(new Date()),
            };

            // logistics_movements에 새로운 문서 생성
            const docRef = await addDoc(collection(db, 'logistics_movements'), {
              ...newMovement,
              date: Timestamp.fromDate(new Date()),
              action_type: 'update',
            });

            console.log("logistics_movements에 문서 생성 완료", docRef.id);

            return {
              logisticsItemId: logistic.uid, // 물류기기 UID
              logisticsItemName: logistic.name, // 물류기기 이름
              quantity: logistic.unit,
              movementType: 'stock',
              // oldMovementId: logisticsInit.current, // 기존 움직임 ID
              newMovementId: docRef.id, // 새로 추가된 움직임 ID
              inventoryId: inventoryId,
            };
          })
        );

        // warehouses에 물류기기 상태 업데이트
        console.log('logisticsItems', logisticsItems)
        await editWarehouseInventory(formState.warehouseUid, logisticsItems, logisticsInit);

        console.log("창고 업데이트 완료");

        alert('인벤토리가 성공적으로 수정되었습니다.');

        // 수정 후 페이지 리디렉션 또는 다른 동작 수행
        router.push(`/inventory/${initialData.id}`);
      } catch (error) {
        console.error('Error updating inventory:', error);
      } finally {
        isSubmitting.current = false;
      }
    },
    [formState, initialData]
  );



  const uploadFilesAndGetURLs = async (files, inventoryUid) => {
    if (!files || files.length === 0) {
      console.error('No files provided for upload.');
      return [];
    }

    const uploadPromises = files.map(async (file) => {
      try {
        const uniqueFileName = `${uuidv4()}_${file.name}`; // UUID로 고유 파일 이름 생성
        const storageRef = ref(storage, `inventory_images/${inventoryUid}/images/${uniqueFileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        console.log('File uploaded:', snapshot.metadata.fullPath);

        const downloadURL = await getDownloadURL(storageRef);
        console.log('File URL:', downloadURL);

        return downloadURL;
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        return null; // 실패한 경우 null을 반환
      }
    });

    const urls = await Promise.all(uploadPromises);
    console.log('Uploaded URLs:', urls);

    // null 또는 undefined가 포함되지 않도록 필터링
    return urls.filter((url) => url !== undefined && url !== null);
  };

  const removeUndefinedFields = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(removeUndefinedFields).filter((item) => item !== undefined);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, removeUndefinedFields(v)])
      );
    } else {
      return obj;
    }
  };


  const handleFilesChange = (acceptedFiles) => {
    console.log('Selected files:', acceptedFiles);  // 파일이 제대로 선택되었는지 확인
    setFiles(acceptedFiles); // 상태 업데이트
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
        <Box>
          <Typography variant="h4" gutterBottom>
            {isEditMode ? 'Edit Inventory' : 'Add Inventory'}
          </Typography>
        </Box>
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
          사진을 추가해주세요.
        </Typography>

        <Box mb={2}>
          <div style={{ padding: 20 }}>
            <UploadMultiFile
              files={files}
              onDrop={handleFilesChange}  // 파일 선택 시 호출되는 함수
              onRemove={handleRemove}
              onRemoveAll={handleRemoveAll}
              showPreview={true}
            />
          </div>
        </Box>

        {/* 물류기기 정보 입력 필드 */}
        <Typography variant="h6" mt={2}>
          물류기기 정보입력
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

            <Box>
              {!isEditMode ?
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSubmit} // 등록 버튼 클릭 시 호출
                  sx={{ mt: 3, mb: 2, py: 2, fontSize: '1.2rem' }}
                  disabled={isSubmitting.current} // 등록 버튼은 항상 활성화
                  fullWidth
                >
                  등록
                </Button> :
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleUpdate} // 등록 버튼 클릭 시 호출
                  sx={{ mt: 3, mb: 2, py: 2, fontSize: '1.2rem' }}
                  disabled={isSubmitting.current} // 등록 버튼은 항상 활성화
                  fullWidth
                >
                  수정
                </Button>
              }
            </Box>

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
          <InventoryLogs logs={logs} onDeleteSuccess={(inventoryUid) => console.log("삭제된 인벤토리 UID:", inventoryUid)} />
        </Box>
      </Box >
    </Container >
  );
};

export default InventoryFormStep2;

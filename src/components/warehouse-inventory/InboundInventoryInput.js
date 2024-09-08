// InboundInventoryInput.js (메인 컴포넌트)
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress, Container, Grid } from '@mui/material';
import { fetchProducts, fetchLogisticsByProductUid } from '../../services/inventoryService';
import { Timestamp, collection, addDoc, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import generateUniqueItemCode from '../../utils/generateUniqueItemCode';
import { useUser } from '../../contexts/UserContext';
import PartnerInfoComponent from './PartnerInfoComponent';
import WarehouseInfoComponent from './WarehouseInfoComponent';
import ProductInfoComponent from './ProductInfoComponent';
import AddedProductsComponent from './AddedProductsComponent';
import MultiImageUpload from '../MultiImageUpload';  // 새로 추가된 import
import TransportForm from '../TransportForm';
import { db, storage } from '../../utils/firebase';
import UploadMultiFile from '../upload-multi-file/UploadMultiFile';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const InboundInventoryInput = ({ initialData, onSubmit }) => {
    const [formState, setFormState] = useState({
        subCategory: '',
        createdAt: '',
        updatedAt: '',
        status: initialData.status,
        products: [
            {
                teamUid: '',
                teamName: '',
                productName: '',
                productWeight: '',
                productType: '',
                quantity: '',
                productUid: '',
                partnerUid: '',
                partnerName: '',
                partnerCategory: '',
            },
        ],
        warehouseUid: initialData.warehouseUid,
        warehouseName: initialData.warehouseName,
        warehouseCode: initialData.warehouseCode,
        images: [],
    });


    const [transportInfo, setTransportInfo] = useState({
        vehicleNumber: '',
        name: '',
        phone: '',
        transportFee: '',
        paymentResponsible: '',
        accountNumber: '',
    });

    const router = useRouter();
    const [inventoryId, setInventoryId] = useState(null);
    const logisticsInit = useRef(null);
    const [products, setProducts] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredTypes, setFilteredTypes] = useState([]);
    const [filteredWeights, setFilteredWeights] = useState([]);
    const [logs, setLogs] = useState([]);
    const isSubmitting = useRef(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [selectedPallets, setSelectedPallets] = useState([]);
    const { user } = useUser();
    const [lastItemCode, setLastItemCode] = useState(0);
    const [files, setFiles] = useState([]);



    useEffect(() => {
        // 사용자별 마지막 아이템 코드 조회
        const fetchLastItemCode = async () => {
            if (user) {
                const queryRef = query(collection(db, 'warehouse_inventory'), where('userId', '==', user.uid), orderBy('itemCode', 'desc'), limit(1));
                const snapshot = await getDocs(queryRef);
                const lastItem = snapshot.docs[0]?.data();
                if (lastItem) {
                    const lastCodeNumber = parseInt(lastItem.itemCode.split('-').pop());
                    setLastItemCode(lastCodeNumber);
                }
            }
        };

        fetchLastItemCode();
    }, [user?.uid]);



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

                // 팀 데이터를 가져오는 로직
                const teamsQuery = query(collection(db, 'teams'), where("status", "==", true), where("division", "==", "car"));
                const teamsSnapshot = await getDocs(teamsQuery);
                const teamsData = teamsSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
                setTeams(teamsData);

                setLoading(false);
                console.log('teams', teams)
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchPallets = async () => {
            try {
                // 물류 정보에서 카테고리가 '바렛트'인 항목만 조회
                const palletsQuery = query(collection(db, 'logistics'), where("category", "==", "바렛트"));
                const palletsSnapshot = await getDocs(palletsQuery);
                const palletData = palletsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSelectedPallets(palletData);
            } catch (error) {
                console.error('Error fetching pallets:', error);
            }
        };

        fetchPallets();
    }, []);

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormState((prev) => ({
                ...prev,
                ...initialData,
                status: initialData.status || 'production',
                warehouseUid: initialData.warehouseUId || initialData.warehouseUid,
                warehouseName: initialData.warehouseName,
                warehouseCode: initialData.warehouseCode,
            }));

            if (!logisticsInit.current) {
                logisticsInit.current = initialData.logistics || [];
                console.log('logisticsInit', logisticsInit);
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
        console.log(formState);
    };

    const handleQuantityChange = (value) => {
        setFormState((prevState) => ({
            ...prevState,
            quantity: Number(value),
        }));
    };


    const isProductInfoComplete = useMemo(() => {
        return formState.productUid && formState.productName && formState.productWeight &&
            formState.productType && formState.quantity && formState.teamUid && formState.teamName;
    }, [formState]);

    // addProductToInventory 함수 수정
    const addProductToInventory = () => {
        if (!formState.productUid || !formState.productName || !formState.productWeight || !formState.productType || !formState.quantity || !formState.teamUid || !formState.teamName) {
            alert('모든 상품 정보 및 팀 정보를 입력해 주세요.');
            return;
        }
        console.log('formState', formState)

        const newProduct = {
            productUid: formState.productUid,
            productName: formState.productName,
            productWeight: formState.productWeight,
            productType: formState.productType,
            quantity: Number(formState.quantity),
            teamUid: formState.teamUid,
            teamName: formState.teamName,
            partnerUid: formState.partnerUid,
            partnerName: formState.partnerName,
            partnerCategory: formState.partnerCategory,
        };

        setFormState((prevState) => ({
            ...prevState,
            products: [...prevState.products, newProduct],
            subCategory: '',
            productWeight: '',
            productType: '',
            productName: '',
            quantity: '',
            productUid: '',
            partnerUid: formState.partnerUid,
            partnerName: formState.partnerName,
            partnerCategory: formState.partnerCategory,
        }));
    };



    const handlePartnerSelect = useCallback((selectedPartner) => {
        setFormState(prevState => ({
            ...prevState,
            partnerUid: selectedPartner.id,
            partnerName: selectedPartner.name,
            partnerCategory: selectedPartner.category,
        }));
        console.log("Partner selected:", selectedPartner);
    }, []);

    const handleAddProduct = () => {
        if (!isProductInfoComplete && formState.products.length === 0) {
            setWarningMessage('적어도 하나의 상품을 추가해주세요.');
            return;
        }

        if (!formState.partnerUid || !formState.partnerName) {
            setWarningMessage('거래처를 선택해주세요.');
            return;
        }

        const newProduct = {
            productUid: formState.productUid,
            productName: formState.productName,
            productWeight: formState.productWeight,
            productType: formState.productType,
            quantity: Number(formState.quantity),
            teamUid: formState.teamUid,
            teamName: formState.teamName,
            partnerUid: formState.partnerUid,
            partnerName: formState.partnerName,
            partnerCategory: formState.partnerCategory,
        };

        setFormState((prevState) => ({
            ...prevState,
            products: [...prevState.products, newProduct],
        }));

        resetProductForm();
        setWarningMessage('');
    };

    const resetProductForm = () => {
        setFormState((prevState) => ({
            ...prevState,
            subCategory: '',
            productWeight: '',
            productType: '',
            productName: '',
            quantity: '',
            productUid: '',
            partnerUid: '',
            partnerName: '',
            partnerCategory: '',
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

    const handleLogisticsIncrement = (index) => {
        setFormState(prev => {
            const updatedLogistics = [...prev.logistics];
            const currentValue = updatedLogistics[index].multiply ? prev.quantity : parseInt(updatedLogistics[index].unit, 10);
            updatedLogistics[index].unit = (currentValue + 1).toString();
            return {
                ...prev,
                logistics: updatedLogistics
            };
        });
    };

    const handleLogisticsDecrement = (index) => {
        setFormState(prev => {
            const updatedLogistics = [...prev.logistics];
            const currentValue = updatedLogistics[index].multiply ? prev.quantity : parseInt(updatedLogistics[index].unit, 10);
            updatedLogistics[index].unit = Math.max(0, currentValue - 1).toString();
            return {
                ...prev,
                logistics: updatedLogistics
            };
        });
    };




    const handleSelectTeam = (selectedTeamUid) => {
        const selectedTeam = teams.find((team) => team.uid === selectedTeamUid);
        if (selectedTeam) {
            setFormState((prevState) => ({
                ...prevState,
                teamUid: selectedTeam.uid,
                teamName: selectedTeam.name,
            }));
        } else {
            console.error('Selected team not found');
        }
    };


    const isValidProduct = (product) => {
        return product.productUid && product.productName && product.productWeight &&
            product.productType && product.quantity && product.teamUid && product.teamName;
    };

    // handleRegister 함수 수정
    const [isNewDriver, setIsNewDriver] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handleRegister = async () => {
        if (!user) {
            console.error("No user logged in");
            return;
        }

        if (!isProductInfoComplete && formState.products.length === 0) {
            setWarningMessage('적어도 하나의 상품을 추가해주세요.');
            return;
        }

        if (!formState.partnerUid || !formState.partnerName) {
            setWarningMessage('거래처를 선택해주세요.');
            return;
        }

        if (!formState.warehouseCode) {
            setWarningMessage('창고 코드가 없습니다. 창고를 선택해주세요.');
            return;
        }

        if (!formState.selectedPalletId) {
            setWarningMessage('바렛트를 선택해주세요.');
            return;
        }

        setLoading(true);
        try {
            // 인벤토리 UID가 존재하지 않으면 새로운 UID 생성 (예: 신규 등록 시)
            const inventoryUid = inventoryId || `inventory_${uuidv4()}`;
            console.log('Files to upload:', files);
            const imageUrls = await uploadFilesAndGetURLs(files, inventoryUid);
            console.log('Uploaded image URLs:', imageUrls);





            const palletRef = doc(db, 'logistics', formState.selectedPalletId);
            const palletSnapshot = await getDoc(palletRef);
            if (!palletSnapshot.exists()) {
                console.error('Selected pallet not found');
                setLoading(false);
                setWarningMessage('선택된 바렛트 정보를 찾을 수 없습니다.');
                return;
            }
            const selectedPallet = { id: palletSnapshot.id, ...palletSnapshot.data() };

            let productsToRegister = formState.products.filter(isValidProduct);

            if (isProductInfoComplete) {
                const currentProduct = {
                    productUid: formState.productUid,
                    productName: formState.productName,
                    productWeight: formState.productWeight,
                    productType: formState.productType,
                    quantity: Number(formState.quantity),
                    teamUid: formState.teamUid,
                    teamName: formState.teamName,
                    partnerUid: formState.partnerUid,
                    partnerName: formState.partnerName,
                    partnerCategory: formState.partnerCategory,
                    pallet: selectedPallet,
                };
                productsToRegister = [currentProduct, ...productsToRegister];
            }

            const inboundDocId = await generateUniqueItemCode(formState.warehouseCode, formState.warehouseUid);

            let nextCodeNumber = lastItemCode + 1;
            const productsWithCodes = productsToRegister.map((product, index) => {
                const itemCode = `${inboundDocId}-${(nextCodeNumber++).toString().padStart(3, '0')}`;
                return { ...product, itemCode };
            });

            if (isNewDriver) {
                try {
                    const newDriverData = {
                        ...transportInfo,
                        isNewDriver: true
                    };
                    const docRef = await addDoc(collection(db, 'transports'), newDriverData);
                    console.log('New driver added with ID: ', docRef.id);
                } catch (error) {
                    console.error('Error adding new transport:', error);
                    setWarningMessage('새 운송기사 등록에 실패했습니다. 다시 시도해 주세요.');
                    setLoading(false);
                    return;
                }
            }

            const inboundData = {
                itemCode: inboundDocId,
                userUid: user.uid,  // user에서 UID 사용
                userName: user.name,  // user에서 사용자 이름 사용
                subCategory: formState.subCategory,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                status: formState.status,
                warehouseUid: formState.warehouseUid,
                warehouseName: formState.warehouseName,
                products: productsWithCodes,
                pallet: selectedPallet,
                images: imageUrls,
                transportInfo: transportInfo,
            };
            try {
                // Firestore에 문서를 추가한 후 문서 참조를 반환받음
                const docRef = await addDoc(collection(db, 'warehouse_inventory'), inboundData);
                setLastItemCode(nextCodeNumber);
                setLoading(false);

                // Firestore에서 생성된 문서의 UID 사용
                alert('입고 재고가 성공적으로 추가되었습니다!');
                router.push(`/warehouse-inventory/${docRef.id}`);
            } catch (error) {
                console.error('Error adding inbound inventory: ', error);
                setLoading(false);
                setWarningMessage('입고 재고 추가에 실패했습니다. 다시 시도해 주세요.');
            }

        } catch (error) {
            console.error('Error adding inbound inventory: ', error);
            setLoading(false);
            setWarningMessage('입고 재고 추가에 실패했습니다. 다시 시도해 주세요.');
        }
    };


    const handleFormChange = (field, value) => {
        setFormState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };


    // 카메라 관련 컴포넌트 
    const handleFilesChange = (newFiles) => {
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    };

    const handleRemove = (file) => {
        setFiles(prevFiles => prevFiles.filter((f) => f !== file));
    };

    const handleRemoveAll = () => {
        setFiles([]);
    };

    const uploadFilesAndGetURLs = async (files, inventoryUid) => {
        if (!files || files.length === 0) {
            console.log('No files to upload');
            return [];
        }

        const uploadPromises = files.map(async (file) => {
            try {
                const uniqueFileName = `${uuidv4()}_${file.name}`;
                const storageRef = ref(storage, `inventory_images/${inventoryUid}/${uniqueFileName}`);
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                console.log('File uploaded successfully:', downloadURL);
                return downloadURL;
            } catch (error) {
                console.error('Error uploading file:', error);
                return null;
            }
        });

        const urls = await Promise.all(uploadPromises);
        return urls.filter(url => url !== null);
    };


    // 차량등록관련 컴포넌트 
    const handleTransportInfoChange = (newTransportInfo) => {
        setTransportInfo(newTransportInfo);
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
        <Container maxWidth="lg">
            <Box display="flex" flexDirection="column" mt={5}>
                <Typography variant="h4" gutterBottom align="center">
                    {isEditMode ? '입고 재고 수정' : '입고 재고 추가'}
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <PartnerInfoComponent
                            formState={formState}
                            handlePartnerSelect={handlePartnerSelect}
                            handleFormChange={handleFormChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <WarehouseInfoComponent
                            initialData={initialData}
                            teams={teams}
                            handleSelectTeam={handleSelectTeam}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TransportForm
                            transportInfo={transportInfo}
                            setTransportInfo={setTransportInfo}
                            isNewDriver={isNewDriver}
                            setIsNewDriver={setIsNewDriver}
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>이미지 업로드</Typography>
                        <UploadMultiFile
                            files={files}
                            onDrop={handleFilesChange}
                            onRemove={handleRemove}
                            onRemoveAll={handleRemoveAll}
                            showPreview={true}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ProductInfoComponent
                            formState={formState}
                            products={products}  // 추가: products 상태를 전달
                            handleSelect={handleSelect}
                            handleQuantityChange={handleQuantityChange}
                            handleLogisticsChange={handleLogisticsChange}
                            handleLogisticsIncrement={handleLogisticsIncrement}
                            handleLogisticsDecrement={handleLogisticsDecrement}
                            filteredWeights={filteredWeights}
                            filteredTypes={filteredTypes}
                            selectedPallets={selectedPallets}
                            handleAddProduct={handleAddProduct}
                            handleRegister={handleRegister}
                            resetProductForm={resetProductForm}
                            isProductInfoComplete={isProductInfoComplete}
                            warningMessage={warningMessage}
                        />
                    </Grid>
                    {formState.products.length > 0 && (
                        <Grid item xs={12}>
                            <AddedProductsComponent
                                products={formState.products.filter(isValidProduct)}
                                handleDeleteProduct={handleDeleteProduct}
                            />
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Container>
    );
};

export default InboundInventoryInput;
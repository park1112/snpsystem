import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress, TextField, Button, Grid, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { fetchProducts, fetchLogisticsByProductUid } from '../../services/inventoryService';
import ReusableButton from '../ReusableButton';
import { getKoreanStatus } from '../../utils/inventoryStatus';
import { Timestamp, collection, addDoc, update, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SearchAndAddComponent from '../common/SearchAndAddComponent';
import PartnerForm from '../partners/PartnerForm';
import generateUniqueItemCode from '../../utils/generateUniqueItemCode';

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
        ], // Added products list with correct structure
        warehouseUid: initialData.warehouseUid, // 초기 데이터에서 가져온 창고 UID
        warehouseName: initialData.warehouseName,
        warehouseCode: initialData.warehouseCode,

    });
    const router = useRouter();
    const [inventoryId, setInventoryId] = useState(null);
    const logisticsInit = useRef(null); // 기존 물류기기 데이터를 저장하기 위한 useRef
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


    // handlePartnerSelect 함수 수정
    const handlePartnerSelect = useCallback((selectedPartner) => {
        setFormState(prevState => ({
            ...prevState,
            partnerUid: selectedPartner.id,
            partnerName: selectedPartner.name,
            partnerCategory: selectedPartner.category,
        }));
        console.log("Partner selected:", selectedPartner);  // 디버깅용 로그 추가
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
    const handleRegister = async () => {
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
        setLoading(true);
        try {
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
                };
                productsToRegister = [currentProduct, ...productsToRegister];
            }

            if (productsToRegister.length === 0) {
                setWarningMessage('유효한 상품이 없습니다. 상품을 추가해주세요.');
                setLoading(false);
                return;
            }


            const inboundDocId = await generateUniqueItemCode(formState.warehouseCode, formState.warehouseUid);

            // 각 상품에 대해 고유 코드 생성
            const productsWithCodes = await Promise.all(productsToRegister.map(async (product, index) => {
                try {
                    const itemCode = `${inboundDocId}-${(index + 1).toString().padStart(3, '0')}`;
                    return { ...product, itemCode };
                } catch (error) {
                    console.error('Error generating item code for product:', product, error);
                    // 에러 발생 시 기본 코드 사용
                    return { ...product, itemCode: `ERROR-${formState.warehouseCode}-${Date.now()}-${index}` };
                }
            }));

            const inboundData = {
                itemCode: inboundDocId,
                subCategory: formState.subCategory,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                status: formState.status,
                warehouseUid: formState.warehouseUid,
                warehouseName: formState.warehouseName,
                products: productsToRegister,
            };




            const inboundDocRef = await addDoc(collection(db, 'warehouse_inventory'), inboundData);
            setLoading(false);
            alert('입고 재고가 성공적으로 추가되었습니다!');
            router.push(`/warehouse-inventory/${inboundDocRef.id}`);
        } catch (error) {
            console.error('Error adding inbound inventory: ', error);
            setLoading(false);
            setWarningMessage('입고 재고 추가에 실패했습니다. 다시 시도해 주세요.');
        }
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
            <SearchAndAddComponent
                collectionName="partners"
                searchField="name"
                FormComponent={PartnerForm}
                onSelect={handlePartnerSelect}
            />
            {formState.partnerName && (
                <Box mt={2}>
                    <Typography variant="h6">Selected Partner</Typography>
                    <Typography>Name: {formState.partnerName}</Typography>
                    <Typography>Category: {formState.partnerCategory}</Typography>
                </Box>
            )}
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        {isEditMode ? 'Edit Inventory' : 'Add Inventory'}
                    </Typography>
                </Box>
                <Box mt={2} width="100%">
                    <Typography variant="h6">Selected Warehouse: {initialData.warehouseName}</Typography>
                    <Typography variant="h6">Selected Status: {getKoreanStatus(initialData.status)}</Typography>

                    {/* 팀 선택 */}
                    <Typography variant="h6">Selected Work Team</Typography>
                    <ReusableButton
                        label="Select Work Team"
                        options={teams.map((team) => team.name)}
                        onSelect={(option) => {
                            const selectedTeam = teams.find((team) => team.name === option);
                            if (selectedTeam) {
                                handleSelectTeam(selectedTeam.uid);
                            } else {
                                console.error('Selected team not found');
                            }
                        }}
                        fullWidth
                    />
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

                <Typography variant="h6" mt={2}>
                    Logistics Information
                </Typography>
                {(formState.logistics || []).map((logistic, index) => (
                    <Box key={index} mb={2}>
                        <Grid container spacing={2} mt={2} alignItems="center">
                            <Grid item xs={6}>
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
                                    disabled={logistic.multiply}
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <IconButton onClick={() => handleLogisticsIncrement(index)} color="primary">
                                    <AddIcon />
                                </IconButton>
                                <IconButton onClick={() => handleLogisticsDecrement(index)} color="primary">
                                    <RemoveIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>
                ))}

                {/* 버튼 생성 필드 */}
                {warningMessage && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {warningMessage}
                    </Typography>
                )}

                <Grid container spacing={2} mt={2} justifyContent="center">
                    <Grid item xs={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddProduct}
                            disabled={!isProductInfoComplete}
                            fullWidth
                        >
                            추가
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleRegister}
                            fullWidth
                        >
                            등록
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            variant="outlined"
                            onClick={resetProductForm}
                            fullWidth
                        >
                            리셋
                        </Button>
                    </Grid>
                </Grid>


                {/* Added Products 섹션 */}
                {formState.products.length > 0 && (
                    <Box mt={4} width="100%">
                        <Typography variant="h6" gutterBottom>
                            Added Products
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>Weight</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formState.products.filter(isValidProduct).map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{product.productName}</TableCell>
                                            <TableCell>{product.productWeight}kg</TableCell>
                                            <TableCell>{product.productType}</TableCell>
                                            <TableCell align="right">{product.quantity}</TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    onClick={() => handleDeleteProduct(index)}
                                                >
                                                    삭제
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

            </Box >
        </Container >
    );
};

export default InboundInventoryInput;

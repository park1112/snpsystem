import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, TextField, Button } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReusableButton from '../ReusableButton';

const InventoryForm = ({ initialData = {}, onSubmit }) => {
    const [formState, setFormState] = useState({
        warehouseName: '',
        teamName: '',
        productCategory: '',
        productWeight: '',
        productType: '',
        grade: '',
        unit: '',
        quantity: '',
        logisticsName: '',
        logisticsQuantity: '',
        createdAt: '',
        updatedAt: ''
    });
    const [warehouses, setWarehouses] = useState([]);
    const [teams, setTeams] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredWeights, setFilteredWeights] = useState([]);
    const [filteredTypes, setFilteredTypes] = useState([]);
    const [logistics, setLogistics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching data...');
                const [warehousesSnapshot, teamsSnapshot, productsSnapshot, logisticsSnapshot] = await Promise.all([
                    getDocs(collection(db, 'warehouses')),
                    getDocs(collection(db, 'teams')),
                    getDocs(collection(db, 'products')),
                    getDocs(collection(db, 'logistics'))
                ]);

                const warehousesData = warehousesSnapshot.docs.map(doc => doc.data());
                const teamsData = teamsSnapshot.docs.map(doc => doc.data());
                const productsData = productsSnapshot.docs.map(doc => doc.data());
                const logisticsData = logisticsSnapshot.docs.map(doc => doc.data());

                console.log('Warehouses Data:', warehousesData);
                console.log('Teams Data:', teamsData);
                console.log('Products Data:', productsData);
                console.log('Logistics Data:', logisticsData);

                setWarehouses(warehousesData);
                setTeams(teamsData);
                setProducts(productsData);
                setLogistics(logisticsData);

                console.log('All data set. Updating loading state to false.');
                setLoading(false);
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
            console.log('Setting initial data:', initialData);
            setFormState({
                warehouseName: initialData.warehouseName || '',
                teamName: initialData.teamName || '',
                productCategory: initialData.productCategory || '',
                productWeight: initialData.productWeight || '',
                productType: initialData.productType || '',
                grade: initialData.grade || '',
                unit: initialData.unit || '',
                quantity: initialData.quantity || '',
                logisticsName: initialData.logisticsName || '',
                logisticsQuantity: initialData.logisticsQuantity || '',
                createdAt: initialData.createdAt || '',
                updatedAt: initialData.updatedAt || ''
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (formState.productCategory) {
            console.log('Filtering products by category:', formState.productCategory);
            const selectedCategoryProducts = products.filter(product => product.category === formState.productCategory);

            const weights = [...new Set(selectedCategoryProducts.map(product => product.name.split('-')[1]))];

            setFilteredWeights(weights);
            setFilteredTypes([]); // Reset types when category changes

            console.log('Filtered Weights:', weights);
        } else {
            setFilteredWeights([]);
            setFilteredTypes([]);
        }
    }, [formState.productCategory, products]);

    useEffect(() => {
        if (formState.productWeight) {
            console.log('Filtering products by weight:', formState.productWeight);
            const selectedWeightProducts = products.filter(product =>
                product.category === formState.productCategory &&
                product.name.includes(formState.productWeight)
            );

            const types = [...new Set(selectedWeightProducts.map(product => product.name.split('-')[2]))];

            setFilteredTypes(types);

            console.log('Filtered Types:', types);
        } else {
            setFilteredTypes([]);
        }
    }, [formState.productWeight, formState.productCategory, products]);

    const handleSelect = (name, value) => {
        console.log(`Setting form state: ${name} = ${value}`);
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        const now = new Date().toISOString();
        const productName = `${formState.productCategory}-${formState.productWeight}-${formState.productType}`;
        const formData = {
            ...formState,
            productName,
            createdAt: formState.createdAt || now,
            updatedAt: now,
        };
        console.log('Submitting form data:', formData);
        onSubmit(formData);
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
                <Typography variant="h6" color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
            <Typography variant="h4">{initialData.id ? 'Edit Inventory' : 'Add Inventory'}</Typography>

            <Typography variant="h6" mt={2}>Select Warehouse</Typography>
            <ReusableButton
                label="Select Warehouse"
                options={warehouses.map(warehouse => warehouse.name)}
                onSelect={(option) => handleSelect('warehouseName', option)}
            />

            <Typography variant="h6" mt={2}>Select Team</Typography>
            <ReusableButton
                label="Select Team"
                options={teams.map(team => team.name)}
                onSelect={(option) => handleSelect('teamName', option)}
            />

            <Typography variant="h6" mt={2}>Select Product Category</Typography>
            <ReusableButton
                label="Select Product Category"
                options={[...new Set(products.map(product => product.category))]}
                onSelect={(option) => handleSelect('productCategory', option)}
            />

            {formState.productCategory && (
                <>
                    <Typography variant="h6" mt={2}>Select Product Weight</Typography>
                    <ReusableButton
                        label="Select Product Weight"
                        options={filteredWeights}
                        onSelect={(option) => handleSelect('productWeight', option)}
                    />
                </>
            )}

            {formState.productWeight && (
                <>
                    <Typography variant="h6" mt={2}>Select Product Type</Typography>
                    <ReusableButton
                        label="Select Product Type"
                        options={filteredTypes}
                        onSelect={(option) => handleSelect('productType', option)}
                    />
                </>
            )}

            <TextField
                label="Quantity"
                name="quantity"
                value={formState.quantity}
                onChange={(e) => handleSelect('quantity', e.target.value)}
                margin="normal"
                fullWidth
            />

            <Typography variant="h6" mt={2}>Select Logistics</Typography>
            <ReusableButton
                label="Select Logistics"
                options={logistics.map(logistic => logistic.name)}
                onSelect={(option) => handleSelect('logisticsName', option)}
            />

            <TextField
                label="Logistics Quantity"
                name="logisticsQuantity"
                value={formState.logisticsQuantity}
                onChange={(e) => handleSelect('logisticsQuantity', e.target.value)}
                margin="normal"
                fullWidth
            />

            {initialData.id && (
                <TextField
                    label="Created At"
                    name="createdAt"
                    value={formState.createdAt}
                    margin="normal"
                    fullWidth
                    disabled
                />
            )}

            <Button variant="contained" color="primary" onClick={handleSubmit}>
                {initialData.id ? 'Update Inventory' : 'Add Inventory'}
            </Button>
        </Box>
    );
};

export default InventoryForm;



// 똑같은 방법으로 만들것인데 
// 첫페이지에서 등록된 공장과 등록된 부자제를 불러와서 선택하면, 다음페이지에서 상품을 버튼으로 불러와 선택하고 저장하면 데이터를 생성할수 있는 페이지를 추가할예정이야.
// 데이터를 생성하면 첫페이지 아닌 상품버튼을 불러오는 페이지로 이동되고, 첫페이지에서 등록된 공장과 등록된 부자제는 항상 같은 형식으로 저장될수 있도록 하고 싶어. 
// 작업자들은 공장과 부자재를 선택해 놓으면 상품만 계속 추가하는 페이지에서 생산품을 등록해야 효율적이기 때문이야. 
// 해당 페이지 하단에는 
// 생성된 상품의 정보들이 나왔으면 좋겟어. 
// 생성된 창고, 상품이름, 바렛트 종류, 바렛트 수량, 상품수량, 생성시간, 이것은 필터할필요 없이 계속 나타낼수 있도록 해줘 로그를 확인하기 위해서야.로그의 갯수는 20개로 최신순으로만 나타날수 있게 해줘 
// 그리고 맨마지막 생성 버튼에는 알림창을 이용해서 정말로 생성할것인가요 ? 라고 한번더 물어봤으면 좋겠어. 
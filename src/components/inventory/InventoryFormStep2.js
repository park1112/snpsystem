import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, TextField, Button } from '@mui/material';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReusableButton from '../ReusableButton';
import InventoryLogs from './InventoryLogs';

const InventoryFormStep2 = ({ initialData, onSubmit }) => {
    const [formState, setFormState] = useState({
        productCategory: '',
        productWeight: '',
        productType: '',
        quantity: '',
        logisticsQuantity: '',
        createdAt: '',
        updatedAt: ''
    });
    const [products, setProducts] = useState([]);
    const [filteredWeights, setFilteredWeights] = useState([]);
    const [filteredTypes, setFilteredTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching data...');
                const productsSnapshot = await getDocs(collection(db, 'products'));
                const productsData = productsSnapshot.docs.map(doc => doc.data());

                setProducts(productsData);
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
        if (formState.productCategory) {
            console.log('Filtering products by category:', formState.productCategory);
            const selectedCategoryProducts = products.filter(product => product.category === formState.productCategory);
            const weights = [...new Set(selectedCategoryProducts.map(product => product.name.split('-')[1]))];
            setFilteredWeights(weights);
            setFilteredTypes([]);
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
        } else {
            setFilteredTypes([]);
        }
    }, [formState.productWeight, formState.productCategory, products]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                console.log('Fetching logs...');
                const logsSnapshot = await getDocs(collection(db, 'inventory'));
                const logsData = logsSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 20);

                setLogs(logsData);
            } catch (error) {
                console.error('Error fetching logs:', error);
            }
        };

        fetchLogs();
    }, []);

    const handleSelect = (name, value) => {
        console.log(`Setting form state: ${name} = ${value}`);
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        console.log('Handle Submit called');
        if (isSubmitting) {
            console.log('Already submitting, ignoring this submit call');
            return;
        }

        setIsSubmitting(true);
        const now = new Date().toISOString();
        const productName = `${formState.productCategory}-${formState.productWeight}-${formState.productType}`;
        const formData = {
            ...initialData,
            ...formState,
            productName,
            createdAt: formState.createdAt || now,
            updatedAt: now,
        };

        console.log('Submitting form data:', formData);

        try {
            await addDoc(collection(db, 'inventory'), formData);
            console.log('Document successfully added');
            setLogs((prevLogs) => [formData, ...prevLogs].slice(0, 20));
            onSubmit(formData);
        } catch (error) {
            console.error('Error adding inventory:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled = !formState.productCategory || !formState.productWeight || !formState.productType;

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
            <Typography variant="h4">Add Inventory</Typography>

            <Box mt={2}>
                <Typography variant="h6">Selected Warehouse: {initialData.warehouseName}</Typography>
                <Typography variant="h6">Selected Team: {initialData.teamName}</Typography>
                <Typography variant="h6">Selected Logistics: {initialData.logisticsName}</Typography>
            </Box>

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

            <TextField
                label="Logistics Quantity"
                name="logisticsQuantity"
                value={formState.logisticsQuantity}
                onChange={(e) => handleSelect('logisticsQuantity', e.target.value)}
                margin="normal"
                fullWidth
            />

            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ mt: 3 }}
                disabled={isSubmitDisabled || isSubmitting}
            >
                Add Inventory
            </Button>

            <Box mt={4} width="100%">
                <InventoryLogs logs={logs} />
            </Box>
        </Box>
    );
};

export default InventoryFormStep2;

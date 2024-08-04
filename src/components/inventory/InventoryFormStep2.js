import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress, TextField, Button, Grid, Container } from '@mui/material';
import { getDocs, collection, doc, runTransaction } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReusableButton from '../ReusableButton';
import InventoryLogs from './InventoryLogs';
import { getKoreanStatus } from '../../utils/inventoryStatus';
import DeleteInventoryItem from './DeleteInventoryItem';

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
  });
  const [products, setProducts] = useState([]);
  const [filteredWeights, setFilteredWeights] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const isSubmitting = useRef(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormState((prev) => ({
        ...prev,
        ...initialData,
        status: initialData.status || 'production',
        warehouseUid: initialData.warehouseUId || initialData.warehouseUid,
        warehouseName: initialData.warehouseName,
      }));
    }
  }, [initialData]);

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

  const handleDeleteLog = (deletedId) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== deletedId));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmitting.current) return;

      isSubmitting.current = true;
      const now = new Date().toISOString();
      const formData = {
        ...formState,
        createdAt: formState.createdAt || now,
        updatedAt: now,
      };

      try {
        await runTransaction(db, async (transaction) => {
          const warehouseUid = formState.warehouseUid || initialData.warehouseUId || initialData.warehouseUid;
          if (!warehouseUid) {
            throw new Error('Warehouse UID is missing');
          }
          const warehouseRef = doc(db, 'warehouses', warehouseUid);
          const inventoryRef = collection(db, 'inventory');

          const warehouseDoc = await transaction.get(warehouseRef);
          if (!warehouseDoc.exists()) {
            throw new Error('Warehouse does not exist');
          }

          const warehouseData = warehouseDoc.data();
          if (!warehouseData.statuses) {
            warehouseData.statuses = {};
          }
          if (!warehouseData.statuses[formData.status]) {
            warehouseData.statuses[formData.status] = { products: {} };
          }
          const statusData = warehouseData.statuses[formData.status];

          const newInventoryDocRef = doc(inventoryRef);
          const newInventoryData = {
            warehouseUid: formState.warehouseUid || initialData.warehouseUid,
            warehouseName: formState.warehouseName || initialData.warehouseName,
            productUid: formData.productUid,
            productName: formData.productName,
            status: formData.status,
            quantity: parseInt(formData.quantity),
            createdAt: formData.createdAt,
            updatedAt: formData.updatedAt,
          };

          transaction.set(newInventoryDocRef, newInventoryData);

          if (!statusData.products[formData.productUid]) {
            statusData.products[formData.productUid] = {
              name: formData.productName,
              count: parseInt(formData.quantity),
              inventoryUids: [newInventoryDocRef.id],
            };
          } else {
            statusData.products[formData.productUid].count += parseInt(formData.quantity);
            statusData.products[formData.productUid].inventoryUids.push(newInventoryDocRef.id);
            statusData.products[formData.productUid].name = formData.productName;
          }

          transaction.update(warehouseRef, {
            [`statuses.${formData.status}`]: statusData,
          });

          setLogs((prevLogs) => {
            const newLogs = [{ ...newInventoryData, id: newInventoryDocRef.id }, ...prevLogs].slice(0, 20);
            return newLogs;
          });
        });

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
        });
      } catch (error) {
        console.error('Error adding inventory:', error);
      } finally {
        isSubmitting.current = false;
      }
    },
    [formState, initialData]
  );

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

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mt: 3, mb: 2, py: 2, fontSize: '1.2rem' }}
          disabled={isSubmitDisabled || isSubmitting.current}
          fullWidth
        >
          추가
        </Button>

        <Box mt={4} width="100%">
          <InventoryLogs logs={logs} onDelete={handleDeleteLog} DeleteComponent={DeleteInventoryItem} />
        </Box>
      </Box>
    </Container>
  );
};

export default InventoryFormStep2;

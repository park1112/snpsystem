import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography, TextField, Button, Grid, Container } from '@mui/material';
import { getDocs, collection, doc, runTransaction } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReusableButton from '../ReusableButton';
import InventoryLogs from './InventoryLogs';
import { getKoreanStatus } from '../../utils/inventoryStatus';
import DeleteInventoryItem from './DeleteInventoryItem';

const InventoryFormStep2 = ({ initialData, onSubmit }) => {
  const [formState, setFormState] = useState({
    productCategory: '',
    productWeight: '',
    productType: '',
    productName: '',
    quantity: '',
    logisticsQuantity: 1,
    productUid: '',
    createdAt: '',
    updatedAt: '',
    status: initialData?.status || '',
  });
  const [products, setProducts] = useState([]);
  const [filteredWeights, setFilteredWeights] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
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
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormState((prev) => ({
        ...prev,
        ...initialData,
      }));
      // 필터링된 데이터 초기화
      if (initialData.productCategory) {
        setFilteredWeights([...new Set(products.filter((product) => product.category === initialData.productCategory)
          .map((product) => product.types?.[0]?.variants?.[0]?.weight.replace('kg', '')))]);
        setFilteredTypes([...new Set(products.filter((product) => product.category === initialData.productCategory && product.types?.[0]?.variants?.[0]?.weight.replace('kg', '') === initialData.productWeight)
          .map((product) => product.types?.[0]?.typeName))]);
      }
    }
  }, [initialData, products]);

  const isSubmitDisabled = useMemo(() => {
    return !formState.productCategory || !formState.productWeight || !formState.productType || !formState.quantity;
  }, [formState.productCategory, formState.productWeight, formState.productType, formState.quantity]);

  const isQuantityButtonsDisabled = useMemo(() => {
    return !(formState.productCategory && formState.productWeight && formState.productType);
  }, [formState.productCategory, formState.productWeight, formState.productType]);

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
          const warehouseUid = formState.warehouseUid || initialData.warehouseUid;
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
            logisticsUid: formState.logisticsUid || initialData.logisticsUid,
            logisticsName: formState.logisticsName || initialData.logisticsName,
            logisticsQuantity: 1,
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

          setLogs((prevLogs) => [{ ...newInventoryData, id: newInventoryDocRef.id }, ...prevLogs]);
        });

        setFormState({
          productCategory: '',
          productWeight: '',
          productType: '',
          productName: '',
          quantity: '',
          logisticsQuantity: '',
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

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
        <Typography variant="h4" gutterBottom>
          Edit Inventory
        </Typography>

        <Box mt={2} width="100%">
          <Typography variant="h6">Selected Warehouse: {initialData.warehouseName}</Typography>
          <Typography variant="h6">Selected Status: {getKoreanStatus(initialData.status)}</Typography>
          <Typography variant="h6">Selected Logistics: {initialData.logisticsName}</Typography>
        </Box>

        <Typography variant="h6" mt={2} width="100%">
          Select Product Category
        </Typography>
        <ReusableButton
          label="Select Product Category"
          options={[...new Set(products.map((product) => product.category))]}
          onSelect={(option) => handleSelect('productCategory', option)}
          fullWidth
          selectedOption={formState.productCategory}
        />

        {formState.productCategory && (
          <>
            <Typography variant="h6" mt={2} width="100%">
              Select Product Weight
            </Typography>
            <ReusableButton
              label="Select Product Weight"
              options={filteredWeights}
              onSelect={(option) => handleSelect('productWeight', option)}
              fullWidth
              selectedOption={formState.productWeight}
            />
          </>
        )}

        {formState.productWeight && (
          <>
            <Typography variant="h6" mt={2} width="100%">
              Select Product Type
            </Typography>
            <ReusableButton
              label="Select Product Type"
              options={filteredTypes}
              onSelect={(option) => handleSelect('productType', option)}
              fullWidth
              selectedOption={formState.productType}
            />
          </>
        )}

        <Grid container spacing={2} mt={2} justifyContent="center">
          {[50, 75, 85].map((qty) => (
            <Grid item xs={4} key={qty}>
              <Button
                variant="contained"
                type="button"
                onClick={() => handleQuantityChange(qty)}
                fullWidth
                disabled={isQuantityButtonsDisabled}
                sx={{ py: 1.5 }}
              >
                {qty}
              </Button>
            </Grid>
          ))}
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
          color="secondary"
          onClick={handleSubmit}
          sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
          disabled={isSubmitDisabled || isSubmitting.current}
          fullWidth
        >
          Update
        </Button>

        <Box mt={4} width="100%">
          <InventoryLogs logs={logs} onDelete={handleDeleteLog} DeleteComponent={DeleteInventoryItem} />
        </Box>
      </Box>
    </Container>
  );
};

export default InventoryFormStep2;

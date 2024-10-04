import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Autocomplete, FormControlLabel, Checkbox, Modal, Button } from '@mui/material';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Logistic from '../../models/Logistic';
import Partner from '../../models/Partner';
import LoadingButton from '../LoadingButton';

const LogisticsForm = ({ initialData = {}, onSubmit }) => {
  const [formState, setFormState] = useState(new Logistic(initialData));
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sameAsProductQuantity, setSameAsProductQuantity] = useState(false);
  const [isPartnerModalOpen, setPartnerModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState(new Partner({}));
  const [isAddingPartner, setIsAddingPartner] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const partnersCollection = collection(db, 'partners');
        const partnersSnapshot = await getDocs(partnersCollection);
        const partnersList = partnersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPartners(partnersList);
      } catch (error) {
        console.error('Error fetching partners:', error);
      }
    };

    fetchPartners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => new Logistic({ ...prevState, [name]: value }));
  };

  const handlePartnerChange = (event, newValue) => {
    if (newValue) {
      setFormState((prevState) => new Logistic({ ...prevState, partnerId: newValue.id, partnerName: newValue.name }));
    } else {
      setFormState((prevState) => new Logistic({ ...prevState, partnerId: '', partnerName: '' }));
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setFormState((prevState) => new Logistic({ ...prevState, partnerName: newInputValue }));
  };

  const handleCheckboxChange = () => {
    setSameAsProductQuantity((prev) => !prev);
    setFormState(
      (prevState) => new Logistic({ ...prevState, quantity: sameAsProductQuantity ? prevState.quantity : 1 })
    );
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onSubmit(formState.toFirestore());
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPartnerModal = () => setPartnerModalOpen(true);
  const handleClosePartnerModal = () => setPartnerModalOpen(false);

  const handleNewPartnerChange = (e) => {
    const { name, value } = e.target;
    setNewPartner((prevState) => new Partner({ ...prevState, [name]: value }));
  };

  const handleAddNewPartner = async () => {
    if (isAddingPartner) return;
    setIsAddingPartner(true);
    try {
      const newPartnerDoc = await addDoc(collection(db, 'partners'), newPartner.toFirestore());
      const newPartnerData = { id: newPartnerDoc.id, ...newPartner };
      setPartners([...partners, newPartnerData]);
      setFormState(
        (prevState) => new Logistic({ ...prevState, partnerId: newPartnerDoc.id, partnerName: newPartner.name })
      );
      handleClosePartnerModal();
    } catch (error) {
      console.error('Error adding new partner:', error);
    } finally {
      setIsAddingPartner(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
      <Typography variant="h4">{initialData.id ? 'Edit Logistics Equipment' : 'Add Logistics Equipment'}</Typography>
      <TextField
        label="Name"
        name="name"
        value={formState.name || ''}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      <TextField
        label="Category"
        name="category"
        value={formState.category || ''}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      <TextField
        label="Quantity"
        name="quantity"
        value={formState.quantity || 1}
        onChange={handleChange}
        margin="normal"
        fullWidth
        disabled={sameAsProductQuantity}
      />
      <FormControlLabel
        control={<Checkbox checked={sameAsProductQuantity} onChange={handleCheckboxChange} />}
        label="Same as product quantity"
      />
      <TextField
        label="Price"
        name="price"
        value={formState.price || ''}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      <Autocomplete
        options={partners}
        getOptionLabel={(option) => option.name || ''}
        value={partners.find((partner) => partner.id === formState.partnerId) || null}
        onChange={handlePartnerChange}
        onInputChange={handleInputChange}
        renderInput={(params) => <TextField {...params} label="Partner" margin="normal" fullWidth />}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        sx={{ width: '100%' }}
      />
      <Button variant="outlined" onClick={handleOpenPartnerModal} sx={{ mt: 2 }}>
        새로운 거래처 등록
      </Button>
      <Modal
        open={isPartnerModalOpen}
        onClose={handleClosePartnerModal}
        aria-labelledby="add-partner-modal-title"
        aria-describedby="add-partner-modal-description"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          mt={5}
          p={3}
          bgcolor="white"
          borderRadius={2}
          boxShadow={3}
        >
          <Typography variant="h5" id="add-partner-modal-title">
            새로운 거래처 등록
          </Typography>
          <TextField
            label="거래처 이름"
            name="name"
            value={newPartner.name || ''}
            onChange={handleNewPartnerChange}
            margin="normal"
            fullWidth
          />
          <TextField
            label="담당자 이름"
            name="master"
            value={newPartner.master || ''}
            onChange={handleNewPartnerChange}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Phone"
            name="phone"
            value={newPartner.phone || ''}
            onChange={handleNewPartnerChange}
            margin="normal"
            fullWidth
          />
          <TextField
            label="계좌번호 ex:홍길동(농협 123-4566-1234-12)"
            name="accountNumber"
            value={newPartner.accountNumber || ''}
            onChange={handleNewPartnerChange}
            margin="normal"
            fullWidth
          />
          <LoadingButton
            isLoading={isAddingPartner}
            onClick={handleAddNewPartner}
            buttonText="새로운 거래처 등록"
            sx={{ mt: 2 }}
            disabled={
              isAddingPartner ||
              !newPartner.name ||
              !newPartner.master ||
              !newPartner.phone ||
              !newPartner.accountNumber
            }
          />
        </Box>
      </Modal>
      {initialData.createdAt && (
        <TextField label="Created At" name="createdAt" value={formState.createdAt} margin="normal" fullWidth disabled />
      )}
      <LoadingButton
        isLoading={loading}
        onClick={handleSubmit}
        buttonText={initialData.id ? 'Update Logistics(물류기기 업데이트)' : 'Add Logistics(물류기기 추가)'}
        sx={{ mt: 2 }}
        disabled={loading || !formState.partnerId}
      />
    </Box>
  );
};

export default LogisticsForm;

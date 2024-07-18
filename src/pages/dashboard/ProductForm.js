// src/components/ProductForm.js
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

import { Container, Typography, Grid, Card, CardHeader, Button, Box, CircularProgress } from '@mui/material';
import Layout from '../../layouts';
import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import CustomTextField from 'src/components/CustomTextField';
import readXlsxFile from 'read-excel-file';
import LoadingButton from 'src/components/LoadingButton';
import FileUploadButton from 'src/components/FileUploadButton';
import RecentProducts from 'src/components/RecentProducts';

// ProductForm 컴포넌트 정의
const ProductForm = () => {
    const { themeStretch } = useSettings();
    const [productData, setProductData] = useState({
        id: '',
        name: '',
        description: '',
        boxSize: '',
        size: '',
        price: 0,
        shopName: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setProductData({
            ...productData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setMessage('');
        try {
            await addDoc(collection(db, 'products'), {
                ...productData,
                createdAt: new Date().toISOString()
            });
            setMessage('Product added successfully!');
            setProductData({
                id: '',
                name: '',
                description: '',
                boxSize: '',
                size: '',
                price: 0,
                shopName: '',
            });
        } catch (e) {
            console.error('Error adding document: ', e);
            setMessage(`Error adding product: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setLoading(true);
            setMessage('');
            try {
                const rows = await readXlsxFile(file);
                const products = rows.slice(1).map(row => ({
                    id: row[0],
                    name: row[1],
                    description: row[2],
                    boxSize: row[3],
                    size: row[4],
                    price: row[5],
                    shopName: row[6],
                    createdAt: new Date().toISOString()
                }));

                const batch = writeBatch(db);

                products.forEach(product => {
                    const docRef = collection(db, 'products').doc();
                    batch.set(docRef, product);
                });

                await batch.commit();
                setMessage('Products added successfully!');
            } catch (e) {
                console.error('Error uploading file: ', e);
                setMessage(`Error uploading products: ${e.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Page title="Add New Product">
            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Typography variant="h3" component="h1" paragraph>
                    Add New Product
                </Typography>
                <Grid item xs={12} md={12}>
                    <Card>
                        <CardHeader title="Product Information" />
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, p: 3 }}>
                            <CustomTextField
                                label="Product ID"
                                name="id"
                                value={productData.id}
                                onChange={handleChange}
                            />
                            <CustomTextField
                                label="Product Name"
                                name="name"
                                value={productData.name}
                                onChange={handleChange}
                            />
                            <CustomTextField
                                label="Product Description"
                                name="description"
                                value={productData.description}
                                onChange={handleChange}
                            />
                            <CustomTextField
                                label="Box Size"
                                name="boxSize"
                                value={productData.boxSize}
                                onChange={handleChange}
                            />
                            <CustomTextField
                                label="Size"
                                name="size"
                                value={productData.size}
                                onChange={handleChange}
                            />
                            <CustomTextField
                                label="Price"
                                name="price"
                                type="number"
                                value={productData.price}
                                onChange={handleChange}
                            />
                            <CustomTextField
                                label="Shop Name"
                                name="shopName"
                                value={productData.shopName}
                                onChange={handleChange}
                            />
                            <LoadingButton type="submit" variant="contained" color="primary" sx={{ mt: 2 }} loading={loading}>
                                Add Product
                            </LoadingButton>
                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} md={12}>
                    <Card>
                        <CardHeader title="Bulk Upload Products" />
                        <Box sx={{ mt: 3, p: 3 }}>
                            <FileUploadButton onChange={handleFileUpload} />
                        </Box>
                    </Card>
                </Grid>
                {message && (
                    <Typography variant="h6" color={message.includes('successfully') ? 'green' : 'red'} sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                )}
                <Grid item xs={12} md={12} sx={{ mt: 3 }}>
                    <Card>
                        <CardHeader title="최근 등록 된 상품" />
                        <Box sx={{ mt: 2, p: 2 }}>
                            <RecentProducts />
                        </Box>
                    </Card>
                </Grid>
            </Container>
        </Page>
    );
};

// getLayout 메서드 정의
ProductForm.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default ProductForm;
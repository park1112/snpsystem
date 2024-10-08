import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Snackbar,
    Alert,
    Box,
} from '@mui/material';
import { collection, addDoc, updateDoc, getDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import Layout from '../../layouts';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUser } from '../../contexts/UserContext';
import ReactMarkdown from 'react-markdown';

const ReportDetailsPage = () => {
    const { user } = useUser();
    const [reportContent, setReportContent] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const router = useRouter();
    const { id } = router.query;
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        if (id) {
            fetchReportData();
        }
    }, [id]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'Reports', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setReportContent(data.content);
                setReportData(data);
                if (data.imageUrls) {
                    setImages(data.imageUrls);
                }
            } else {
                setSnackbar({ open: true, message: '해당 보고서를 찾을 수 없습니다.', severity: 'error' });
                router.push('/reports');
            }
        } catch (error) {
            console.error('보고서 가져오기 오류:', error);
            setSnackbar({ open: true, message: '보고서 데이터를 불러오는 중 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReportChange = (event) => {
        setReportContent(event.target.value);
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        setImages((prevImages) => [...prevImages, ...imageFiles]);
    };

    const handleRemoveImage = (index) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const reportData = {
                content: reportContent,
                updatedAt: new Date(),
                imageCount: images.length,
            };

            const docRef = doc(db, 'Reports', id);
            await updateDoc(docRef, reportData);

            const uploadedImageUrls = [];
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                if (typeof image !== 'string') {
                    const imageRef = ref(storage, `reports/${id}/image_${i}.${image.name.split('.').pop()}`);
                    await uploadBytes(imageRef, image);
                    const downloadURL = await getDownloadURL(imageRef);
                    uploadedImageUrls.push(downloadURL);
                } else {
                    uploadedImageUrls.push(image);
                }
            }

            await updateDoc(docRef, { imageUrls: uploadedImageUrls });

            setSnackbar({ open: true, message: '보고서가 성공적으로 수정되었습니다.', severity: 'success' });
            router.push(`/reports/view?id=${id}`);
        } catch (error) {
            console.error('보고서 수정 오류:', error);
            setSnackbar({ open: true, message: '보고서 수정 중 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    보고서 데이터 로딩 중...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom color="primary" align="center">
                보고서 수정
            </Typography>
            <Paper sx={{ p: 3, mt: 3 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        multiline
                        rows={20}
                        variant="outlined"
                        label="보고서 내용"
                        value={reportContent}
                        onChange={handleReportChange}
                        required
                        sx={{ mb: 3 }}
                        placeholder="여기에 Markdown 형식으로 보고서 내용을 작성하세요."
                    />

                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        multiple
                        type="file"
                        onChange={handleImageUpload}
                    />
                    <label htmlFor="raised-button-file">
                        <Button variant="contained" component="span" sx={{ mb: 3 }}>
                            이미지 업로드
                        </Button>
                    </label>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {images.map((image, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Box position="relative">
                                    <Image
                                        src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                                        alt={`업로드된 이미지 ${index + 1}`}
                                        width={300}
                                        height={200}
                                        layout="responsive"
                                        objectFit="cover"
                                    />
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleRemoveImage(index)}
                                        sx={{ position: 'absolute', top: 5, right: 5 }}
                                    >
                                        삭제
                                    </Button>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
                        {loading ? <CircularProgress size={24} /> : '보고서 수정'}
                    </Button>
                </form>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

ReportDetailsPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default ReportDetailsPage;
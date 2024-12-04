import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Rating,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    TextField,
} from '@mui/material';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Layout from '../../layouts';
import StarIcon from '@mui/icons-material/Star';
import { useUser } from '../../contexts/UserContext';
import { useRouter } from 'next/router';

const Checklist = () => {
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState({});
    const [ratings, setRatings] = useState({});
    const [questionsLoaded, setQuestionsLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [personalInfo, setPersonalInfo] = useState({ name: '', address: '', contact: '' });
    const [additionalNotes, setAdditionalNotes] = useState('');
    const { user } = useUser();
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (questionsLoaded && id) {
            fetchExistingData();
        }
    }, [questionsLoaded, id]);

    const fetchQuestions = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'checklist_questions'));
            const fetchedQuestions = {};
            const fetchedCategories = new Set();
            querySnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (!fetchedQuestions[data.categoryName]) {
                    fetchedQuestions[data.categoryName] = [];
                }
                fetchedQuestions[data.categoryName].push({
                    id: doc.id,
                    ...data,
                    order: data.order || 0
                });
                fetchedCategories.add(data.categoryName);
            });

            Object.keys(fetchedQuestions).forEach(category => {
                fetchedQuestions[category].sort((a, b) => a.order - b.order);
            });

            setQuestions(fetchedQuestions);
            setCategories(Array.from(fetchedCategories));

            // Initialize ratings with 0
            const initialRatings = Object.values(fetchedQuestions).flat().reduce((acc, question) => ({
                ...acc,
                [question.id]: 0
            }), {});
            setRatings(initialRatings);

            setQuestionsLoaded(true);
        } catch (error) {
            console.error('질문 로딩 오류:', error);
            setSnackbar({ open: true, message: '질문을 불러오는 데 실패했습니다.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };


    const fetchExistingData = async () => {
        try {
            const docRef = doc(db, 'checklist_results', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPersonalInfo(data.personalInfo);
                setAdditionalNotes(data.additionalNotes);

                // 모든 질문에 대해 rating을 0으로 초기화
                const initialRatings = Object.values(questions).flat().reduce((acc, question) => ({
                    ...acc,
                    [question.id]: 0
                }), {});

                // 기존 데이터의 rating으로 덮어쓰기
                data.questionDetails.forEach(q => {
                    if (Object.prototype.hasOwnProperty.call(initialRatings, q.id)) {
                        initialRatings[q.id] = q.rating;
                    }
                });

                setRatings(initialRatings);
            } else {
                setSnackbar({ open: true, message: '체크리스트를 찾을 수 없습니다.', severity: 'error' });
            }
        } catch (error) {
            console.error('기존 데이터 로딩 오류:', error);
            setSnackbar({ open: true, message: '기존 데이터를 불러오는 데 실패했습니다.', severity: 'error' });
        }
    };




    const handleRatingChange = (questionId, newValue) => {
        setRatings(prev => ({
            ...prev,
            [questionId]: newValue
        }));
    };

    const handlePersonalInfoChange = (field, value) => {
        setPersonalInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateTotalScore = () => {
        const totalPoints = Object.values(ratings).reduce((sum, rating) => sum + rating, 0);
        const maxPossiblePoints = Object.values(questions).flat().length * 5;
        return (totalPoints / maxPossiblePoints) * 100;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const totalScore = calculateTotalScore();
            const questionDetails = Object.values(questions).flat().map(q => ({
                id: q.id,
                text: q.text,
                category: q.categoryName,
                rating: ratings[q.id],
                order: q.order
            }));
            const data = {
                personalInfo,
                questionDetails,
                totalScore,
                additionalNotes,
                updatedAt: serverTimestamp(),
                author: {
                    id: user?.uid || 'unknown',
                    name: user?.name || 'Unknown User',
                    email: user?.email || 'unknown'
                }
            };

            if (id) {
                await updateDoc(doc(db, 'checklist_results', id), data);
                setSnackbar({ open: true, message: '체크리스트가 성공적으로 수정되었습니다.', severity: 'success' });
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, 'checklist_results'), data);
                setSnackbar({ open: true, message: '체크리스트가 성공적으로 제출되었습니다.', severity: 'success' });
            }
            router.push('/check-list/list');
        } catch (error) {
            console.error('체크리스트 제출/수정 오류:', error);
            setSnackbar({ open: true, message: '체크리스트 제출/수정에 실패했습니다.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    체크리스트 로딩 중...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                {id ? '체크리스트 수정' : '상품 평가 체크리스트'}
            </Typography>
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        label="이름"
                        value={personalInfo.name}
                        onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="주소"
                        value={personalInfo.address}
                        onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="연락처"
                        value={personalInfo.contact}
                        onChange={(e) => handlePersonalInfoChange('contact', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                </Box>

                {categories.map((category) => (
                    <Box key={category} sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            {category}
                        </Typography>
                        {questions[category].map((question) => (
                            <Box key={question.id} sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    {question.text}
                                </Typography>
                                <Rating
                                    name={`rating-${question.id}`}
                                    value={ratings[question.id] || 0}
                                    onChange={(event, newValue) => handleRatingChange(question.id, newValue)}
                                    precision={1}
                                    icon={<StarIcon fontSize="inherit" />}
                                    emptyIcon={<StarIcon fontSize="inherit" />}
                                />
                            </Box>
                        ))}
                    </Box>
                ))}

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="기타 특이사항"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    sx={{ mt: 3, mb: 3 }}
                />

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        총점: {calculateTotalScore().toFixed(2)}%
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                        sx={{ mt: 2 }}
                    >
                        {submitting ? <CircularProgress size={24} /> : (id ? '체크리스트 수정' : '체크리스트 제출')}
                    </Button>
                </Box>
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



export default Checklist;
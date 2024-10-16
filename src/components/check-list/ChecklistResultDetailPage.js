import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    CircularProgress,
    Rating,
    Divider,
    Grid,
} from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useRouter } from 'next/router';
import StarIcon from '@mui/icons-material/Star';

const ChecklistResultDetailPage = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (id) {
            fetchResult();
        }
    }, [id]);

    const fetchResult = async () => {
        try {
            const resultDoc = await getDoc(doc(db, 'checklist_results', id));
            if (resultDoc.exists()) {
                setResult({
                    id: resultDoc.id,
                    ...resultDoc.data(),
                    createdAt: resultDoc.data().createdAt?.toDate().toLocaleString() || 'Unknown'
                });
            } else {
                console.log('결과를 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('결과 로딩 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    체크리스트 결과 로딩 중...
                </Typography>
            </Container>
        );
    }

    if (!result) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h6">결과를 찾을 수 없습니다.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                체크리스트 결과 상세
            </Typography>
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    작성자: {result.author?.name || '알 수 없음'}
                </Typography>
                <Typography variant="h6" gutterBottom>
                    생성 일시: {result.createdAt}
                </Typography>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                    총점: {result.totalScore.toFixed(2)}%
                </Typography>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                    기본정보:
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                        <Typography>이름: {result.personalInfo.name}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography>주소: {result.personalInfo.address}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography>연락처: {result.personalInfo.contact}</Typography>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                    질문별 평가:
                </Typography>
                {Object.entries(result.questionDetails.reduce((acc, question) => {
                    if (!acc[question.category]) {
                        acc[question.category] = [];
                    }
                    acc[question.category].push(question);
                    return acc;
                }, {})).map(([category, questions]) => (
                    <Box key={category} sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {category}
                        </Typography>
                        {questions.map((question, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="body1" gutterBottom>
                                    {question.text}
                                </Typography>
                                <Rating
                                    name={`rating-${index}`}
                                    value={question.rating}
                                    readOnly
                                    precision={1}
                                    icon={<StarIcon fontSize="inherit" />}
                                    emptyIcon={<StarIcon fontSize="inherit" />}
                                />
                            </Box>
                        ))}
                    </Box>
                ))}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                    기타 특이사항:
                </Typography>
                <Typography variant="body1">
                    {result.additionalNotes || '없음'}
                </Typography>
            </Paper>
        </Container>
    );
};



export default ChecklistResultDetailPage;

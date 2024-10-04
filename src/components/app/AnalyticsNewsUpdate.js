import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader, CircularProgress } from '@mui/material';
// utils
import { fToNow } from '../../utils/formatTime';
// components
import Image from '../Image';
import Iconify from '../Iconify';
import Scrollbar from '../Scrollbar';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import fetchNews from '../../pages/api/fetchNews'; // fetchNews를 가져옴

export default function AnalyticsNewsUpdate() {
    const [newsArticles, setNewsArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStoredNews = async () => {
            try {
                // 뉴스 컬렉션에서 postedAt을 기준으로 최신 20개의 뉴스를 가져옴
                const newsQuery = query(collection(db, 'news'), orderBy('postedAt', 'desc'), limit(20));
                const querySnapshot = await getDocs(newsQuery);

                if (querySnapshot.empty) {
                    // 데이터가 없는 경우 fetchNews 실행
                    await fetchNewsAndUpdate();
                } else {
                    // 기존 데이터를 가져옴
                    const articles = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    setNewsArticles(articles);
                }
            } catch (err) {
                setError('뉴스 데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        const fetchNewsAndUpdate = async () => {
            try {
                setLoading(true);
                console.log('새로운 뉴스 데이터를 가져오고 저장 중입니다...');
                const response = await fetch('/api/fetchNews');
                if (!response.ok) {
                    throw new Error('뉴스 데이터를 가져오는데 실패했습니다.');
                }
                console.log('새로운 뉴스 데이터를 가져와서 저장 완료.');

                // Firestore에서 갱신된 데이터를 다시 가져옴
                const newsQuery = query(collection(db, 'news'), orderBy('postedAt', 'desc'), limit(20));
                const querySnapshot = await getDocs(newsQuery);
                const articles = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                console.log('가져온 뉴스 데이터:', articles); // 콘솔로 가져온 데이터 확인
                setNewsArticles(articles); // 상태에 뉴스 데이터 설정

            } catch (err) {
                console.error('뉴스 데이터를 업데이트하는 중 오류가 발생했습니다:', err);
                setError('뉴스 데이터를 업데이트하는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchStoredNews();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography variant="body2" color="error">
                {error}
            </Typography>
        );
    }

    if (newsArticles.length === 0) {
        return (
            <Typography variant="body2">
                뉴스 기사가 없습니다.
            </Typography>
        );
    }

    return (
        <Card>
            <CardHeader title="News Update" />

            <Scrollbar>
                <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
                    {newsArticles.map((news) => (
                        <NewsItem key={news.id} news={news} />
                    ))}
                </Stack>
            </Scrollbar>

            <Divider />

            <Box sx={{ p: 2, textAlign: 'right' }}>
                <Button size="small" color="inherit" endIcon={<Iconify icon={'eva:arrow-ios-forward-fill'} />}>
                    View all
                </Button>
            </Box>
        </Card>
    );
}

NewsItem.propTypes = {
    news: PropTypes.shape({
        description: PropTypes.string,
        image: PropTypes.string,
        postedAt: PropTypes.instanceOf(Date), // Date 객체를 기대
        title: PropTypes.string,
        link: PropTypes.string,
    }),
};

function NewsItem({ news }) {
    const { image, title, description, postedAt, link } = news;
    const postDate = postedAt.toDate(); // Firestore의 Timestamp를 Date 객체로 변환

    return (
        <Stack direction="row" alignItems="center" spacing={2}>
            <Image alt={title} src={image} sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }} />
            <Box sx={{ minWidth: 240 }}>
                <Link href={link} color="inherit" target="_blank" rel="noopener noreferrer">
                    <Typography variant="subtitle2" noWrap>
                        {title}
                    </Typography>
                </Link>
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                    {description}
                </Typography>
            </Box>
            <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
                {fToNow(postDate)} {/* Date 객체를 `fToNow`로 전달 */}
            </Typography>
        </Stack>
    );
}

import { CardContent, CardHeader, Container, Grid, Card, Button, Typography, CircularProgress } from '@mui/material';
import Layout from '../layouts';
import useSettings from '../hooks/useSettings';
import Page from '../components/Page';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AppWidgetSummary from '../components/summary/Summary';
import { useTheme } from '@emotion/react';
import NewsList from '../components/news/NewsList';
import GoogleNewsList from '../components/news/GoogleNewsList';
import AnalyticsWidgetSummary from '../components/app/AnalyticsWidgetSummary';
import AnalyticsWebsiteVisits from '../components/app/AnalyticsWebsiteVisits';
import AnalyticsCurrentVisits from '../components/app/AnalyticsCurrentVisits';
import BookingRoomAvailable from '../components/app/BookingRoomAvailable';
import BankingExpensesCategories from '../components/app/BankingExpensesCategories';
import BookingReservationStats from '../components/app/BookingReservationStats';
import AnalyticsNewsUpdate from '../components/app/AnalyticsNewsUpdate';

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default function Home() {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const [newsArticles, setNewsArticles] = useState([]);
  const [googleNewsArticles, setGoogleNewsArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingGoogleNews, setLoadingGoogleNews] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchNews = async () => {
  //     const apiKey = '9c899f3de43047b3871b22aef10a393a'; // NewsAPI에서 발급받은 API 키
  //     const query = '양파'; // 검색 키워드
  //     const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&apiKey=${apiKey}`;
  //     try {
  //       const response = await fetch(url);
  //       const data = await response.json();
  //       console.log('Fetched NewsAPI Articles:', data.articles); // 데이터 콘솔 출력
  //       if (data.articles) {
  //         setNewsArticles(data.articles.slice(0, 6)); // 최대 5개의 뉴스 기사만 표시
  //       } else {
  //         setError('뉴스 데이터를 불러오는데 실패했습니다.');
  //       }
  //     } catch (error) {
  //       setError('뉴스 데이터를 불러오는데 오류가 발생했습니다.');
  //     } finally {
  //       setLoadingNews(false);
  //     }
  //   };

  //   const fetchGoogleNews = async () => {
  //     try {
  //       const response = await axios.get('/api/news');
  //       console.log('Fetched Google News Articles:', response.data); // 데이터 콘솔 출력
  //       setGoogleNewsArticles(response.data.slice(0, 6)); // 최대 5개의 구글 뉴스 기사만 표시
  //     } catch (error) {
  //       console.error('Error fetching Google news:', error);
  //     } finally {
  //       setLoadingGoogleNews(false);
  //     }
  //   };

  //   fetchNews();
  //   fetchGoogleNews();
  // }, []);

  return (
    <Page title="SNP SYSTEM 정확한 데이터를 통한 편리한 관리">
      <Container maxWidth={themeStretch ? false : 'xl'}>

        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          {/* 상단메뉴 */}
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary title="시장판매" total={110002} icon={'ant-design:android-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary title="개인상회" total={1352831} color="info" icon={'ant-design:apple-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="매출액"
              total={1723315}
              color="warning"
              icon={'ant-design:windows-filled'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary title="미수금" total={234} color="error" icon={'ant-design:bug-filled'} />
          </Grid>
          {/* 상단메뉴 */}

          <Grid item xs={12} md={6} lg={8}>
            <BankingExpensesCategories />
          </Grid>

          <Grid item xs={12} md={4}>
            <BookingRoomAvailable />
          </Grid>

          {/* 중단 그래픽 */}
          <Grid item xs={12} md={8}>
            <BookingReservationStats />
          </Grid>

          {/* <Grid item xs={12} md={6} lg={8}>
            <AnalyticsWebsiteVisits />
          </Grid> */}

          <Grid item xs={12} md={6} lg={4}>
            <AnalyticsCurrentVisits />
          </Grid>
          {/* 중단 그래픽 */}
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsNewsUpdate />
        </Grid>

        <Grid container spacing={3} sx={{ mt: 1 }}>

          {/* <Grid item xs={12} md={6} lg={8}>
            <Card>
              <CardHeader title="NewsAPI 뉴스" />

              <CardContent>
                {loadingNews ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                  </div>
                ) : error ? (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                ) : newsArticles.length > 0 ? (
                  // <NewsList articles={newsArticles} />
                  <AnalyticsNewsUpdate />
                ) : (
                  <Typography variant="body2">뉴스 기사가 없습니다.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid> */}


          {/* <Grid item xs={12} md={6} lg={4}>
            <AppWidgetSummary
              title="생산수량"
              total={1513}
              chartColor={theme.palette.primary.main}
              chartData={[5, 18, 12, 51, 68, 11, 39, 37, 27, 20]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <AppWidgetSummary
              title="재고수량"
              percent={0.2}
              total={4876}
              chartColor={theme.palette.chart.blue[0]}
              chartData={[20, 41, 63, 33, 28, 35, 50, 46, 11, 26]}
            />
          </Grid> */}



          {/* <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Google 뉴스" />
              <CardContent>
                {loadingGoogleNews ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                  </div>
                ) : googleNewsArticles.length > 0 ? (
                  // <GoogleNewsList articles={googleNewsArticles} />
                ) : (
                  <Typography variant="body2">Google 뉴스 기사가 없습니다.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid> */}
        </Grid>
      </Container>
    </Page >
  );
}

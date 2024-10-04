import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Paper,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
} from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ReportDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      if (id) {
        try {
          const docRef = doc(db, 'SelectedChecklists', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setReportData(docSnap.data());
          } else {
            console.log('문서가 존재하지 않습니다!');
          }
        } catch (error) {
          console.error('데이터 가져오기 오류:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReportData();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          데이터 불러오는 중...
        </Typography>
      </Container>
    );
  }

  if (!reportData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">데이터를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom color="primary" align="center" sx={{ mb: 4 }}>
        선택된 체크리스트 상세 정보
      </Typography>
      <Grid container spacing={3}>
        {reportData.selectedData.map((store, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card elevation={3}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <StorefrontIcon sx={{ color: 'white' }} />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" component="div">
                    {store.storeName}
                  </Typography>
                }
                subheader={
                  <Chip icon={<CategoryIcon />} label={store.category} color="primary" size="small" sx={{ mt: 1 }} />
                }
              />
              <Divider />
              <CardContent>
                <List dense>
                  {store.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex}>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

ReportDetailsPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ReportDetailsPage;

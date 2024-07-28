import NewsDetail from '../../../components/news/NewsDetail';
import Layout from '../../../layouts';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

const NewsPage = (props) => {
  const router = useRouter();
  const { link } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (link) {
      setLoading(false);
    }
  }, [link]);

  return (
    <Layout>
      <NewsDetail>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <iframe src={link} style={{ width: '100%', height: '100vh', border: 'none' }} />
          </Box>
        )}
      </NewsDetail>
    </Layout>
  );
};

export default NewsPage;

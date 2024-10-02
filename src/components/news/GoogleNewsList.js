// src/components/news/GoogleNewsList.js
import { Card, CardContent, Typography, Grid, Avatar, CardMedia, Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const GoogleNewsList = ({ keyword }) => {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const newsCollection = collection(db, 'news');
      const q = query(newsCollection, where('keyword', '==', keyword), orderBy('updatedAt', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const latestDoc = querySnapshot.docs[0];
        setArticles(latestDoc.data().articles);
      }
      setLoading(false);
    };

    fetchNews();
  }, [keyword]);

  const handleClick = (index) => {
    router.push({
      pathname: `/news/google/${index}`,
      query: { link: articles[index].link },
    });
  };

  const handleImageLoad = (index) => {
    setImageLoadingStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = false;
      return newStates;
    });
  };

  const truncate = (str, n) => str.length > n ? str.substr(0, n - 1) + '...' : str;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {articles.map((article, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Card onClick={() => handleClick(index)} style={{ cursor: 'pointer', marginBottom: '16px' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar src={article.sourceLogo} alt={article.sourceName} sx={{ width: 24, height: 24 }} />
                <Typography variant="caption" style={{ marginLeft: '8px' }}>
                  {truncate(article.sourceName, 20)}
                </Typography>
              </Box>
              <Typography variant="h6" component="div" style={{ marginTop: '8px' }}>
                {article.title}
              </Typography>
              {article.imageUrl && (
                <Box position="relative" style={{ height: '98px', marginTop: '8px' }}>
                  {imageLoadingStates[index] && (
                    <Box position="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                  <CardMedia
                    component="img"
                    height="98"
                    image={article.imageUrl}
                    alt={article.title}
                    onLoad={() => handleImageLoad(index)}
                    style={{ display: imageLoadingStates[index] ? 'none' : 'block' }}
                  />
                </Box>
              )}
              <Typography variant="caption" style={{ marginTop: '8px', display: 'block' }}>
                {new Date(article.date).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default GoogleNewsList;

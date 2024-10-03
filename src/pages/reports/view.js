import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Box,
} from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Layout from '../../layouts';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const ViewReportPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openImage, setOpenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;

      try {
        const reportDoc = await getDoc(doc(db, 'Reports', id));
        if (reportDoc.exists()) {
          setReport(reportDoc.data());
        } else {
          console.log('보고서를 찾을 수 없습니다');
        }
      } catch (error) {
        console.error('보고서 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleImageOpen = (imageUrl, index) => {
    setOpenImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const handleImageClose = () => {
    setOpenImage(null);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : report.imageUrls.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex < report.imageUrls.length - 1 ? prevIndex + 1 : 0));
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          보고서 로딩 중...
        </Typography>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">보고서를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom color="primary" align="center" sx={{ mb: 4 }}>
          시장 조사 보고서
        </Typography>

        <Box sx={{ mb: 4 }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => <Typography variant="h4" gutterBottom {...props} />,
              h2: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} sx={{ mt: 3 }} />,
              h3: ({ node, ...props }) => <Typography variant="h6" gutterBottom {...props} sx={{ mt: 2 }} />,
              p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} />,
              ul: ({ node, ...props }) => <Box component="ul" sx={{ pl: 4 }} {...props} />,
              ol: ({ node, ...props }) => <Box component="ol" sx={{ pl: 4 }} {...props} />,
              li: ({ node, ...props }) => <Typography component="li" variant="body1" {...props} sx={{ mb: 1 }} />,
            }}
          >
            {report.content}
          </ReactMarkdown>
        </Box>

        {report.imageUrls && report.imageUrls.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom color="primary">
              첨부 이미지
            </Typography>
            <Grid container spacing={2}>
              {report.imageUrls.map((imageUrl, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    elevation={3}
                    sx={{ p: 1, cursor: 'pointer' }}
                    onClick={() => handleImageOpen(imageUrl, index)}
                  >
                    <Image
                      src={imageUrl}
                      alt={`보고서 이미지 ${index + 1}`}
                      width={300}
                      height={200}
                      layout="responsive"
                      objectFit="cover"
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      <Dialog open={!!openImage} onClose={handleImageClose} maxWidth="lg" fullWidth>
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={handleImageClose}
          >
            <CloseIcon sx={{ color: 'white' }} />
          </IconButton>
          <IconButton
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            onClick={handlePrevImage}
          >
            <ArrowBackIosNewIcon sx={{ color: 'white' }} />
          </IconButton>
          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            onClick={handleNextImage}
          >
            <ArrowForwardIosIcon sx={{ color: 'white' }} />
          </IconButton>
          {openImage && (
            <img
              src={report.imageUrls[currentImageIndex]}
              alt={`확대된 이미지 ${currentImageIndex + 1}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

ViewReportPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ViewReportPage;

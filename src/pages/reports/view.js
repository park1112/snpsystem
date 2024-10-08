import React, { useState, useEffect, useCallback } from 'react';
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
  Snackbar,
  Button,
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
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const ViewReportPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openImage, setOpenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchReport = useCallback(async () => {
    if (!id) return;

    const sessionReport = sessionStorage.getItem(`report_${id}`);
    const sessionData = sessionReport ? JSON.parse(sessionReport) : null;

    // 세션 데이터가 있고, 업데이트 시간이 세션 데이터의 업데이트 시간과 같다면 세션 데이터 사용
    if (sessionData && sessionData.updatedAt) {
      try {
        const reportDoc = await getDoc(doc(db, 'Reports', id));
        if (reportDoc.exists()) {
          const reportData = reportDoc.data();
          const updatedAtTimestamp = reportData.updatedAt?.toDate().getTime();

          if (updatedAtTimestamp === sessionData.updatedAt) {
            setReport(sessionData.report);
            setCreatedAt(sessionData.createdAt);
            setUpdatedAt(sessionData.updatedAt);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('보고서 업데이트 시간 확인 오류:', error);
      }
    }

    // 세션 데이터가 없거나 업데이트되었을 경우 새로운 데이터 가져오기
    try {
      const reportDoc = await getDoc(doc(db, 'Reports', id));
      if (reportDoc.exists()) {
        const reportData = reportDoc.data();
        const createdAtTimestamp = reportData.createdAt?.toDate().getTime();
        const updatedAtTimestamp = reportData.updatedAt?.toDate().getTime();

        if (reportData.authorId) {
          const authorDoc = await getDoc(doc(db, 'Users', reportData.authorId));
          if (authorDoc.exists()) {
            reportData.authorName = authorDoc.data().name || '알 수 없음';
          }
        }

        setReport(reportData);
        setCreatedAt(createdAtTimestamp);
        setUpdatedAt(updatedAtTimestamp);

        // 보고서 데이터와 이미지 URL을 세션 스토리지에 저장
        const newSessionData = {
          report: reportData,
          createdAt: createdAtTimestamp,
          updatedAt: updatedAtTimestamp,
        };
        sessionStorage.setItem(`report_${id}`, JSON.stringify(newSessionData));

        // 이미지 URL을 미리 캐시
        if (reportData.imageUrls) {
          reportData.imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
          });
        }
      } else {
        console.log('보고서를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('보고서 로딩 오류:', error);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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

  const handleImageLoad = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleDownload = useCallback(async () => {
    if (!openImage) return;

    try {
      const response = await fetch(report.imageUrls[currentImageIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_image_${currentImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('이미지 다운로드 오류:', error);
    }
  }, [openImage, report, currentImageIndex]);

  const handleCopyReport = () => {
    const reportText = `${report.content}\n\n첨부 이미지:\n${report.imageUrls ? report.imageUrls.join('\n') : '없음'}`;
    navigator.clipboard.writeText(reportText).then(() => {
      setSnackbarMessage('보고서가 클립보드에 복사되었습니다.');
      setSnackbarOpen(true);
    }).catch(err => {
      console.error('복사 중 오류 발생:', err);
      setSnackbarMessage('보고서 복사 중 오류가 발생했습니다.');
      setSnackbarOpen(true);
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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

        {report.authorName && (
          <Typography variant="subtitle1" align="center" sx={{ mb: 3 }}>
            작성자: {report.authorName}
          </Typography>
        )}


        <Button
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyReport}
          sx={{ mb: 3 }}
        >
          보고서 복사
        </Button>

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

        {createdAt && (
          <Typography variant="caption" align="right" display="block" sx={{ mt: 2 }}>
            생성 시간: {new Date(createdAt).toLocaleString()}
          </Typography>
        )}
        {updatedAt && updatedAt !== createdAt && (
          <Typography variant="caption" align="right" display="block" sx={{ mt: 1 }}>
            마지막 업데이트: {new Date(updatedAt).toLocaleString()}
          </Typography>
        )}

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
                    sx={{ p: 1, cursor: 'pointer', position: 'relative', minHeight: '200px' }}
                    onClick={() => handleImageOpen(imageUrl, index)}
                  >
                    {imageLoading[index] !== false && (
                      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <CircularProgress />
                      </Box>
                    )}
                    <Image
                      src={imageUrl}
                      alt={`보고서 이미지 ${index + 1}`}
                      width={300}
                      height={200}
                      layout="responsive"
                      objectFit="cover"
                      onLoadingComplete={() => handleImageLoad(index)}
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
          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              bottom: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            onClick={handleDownload}
          >
            <DownloadIcon sx={{ color: 'white' }} />
          </IconButton>
          {openImage && (
            <>
              <img
                src={report.imageUrls[currentImageIndex]}
                alt={`확대된 이미지 ${currentImageIndex + 1}`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              {report.imageUrls.map((url, index) => (
                <img
                  key={url}
                  src={url}
                  alt={`미리 로드된 이미지 ${index + 1}`}
                  style={{ display: 'none' }}
                />
              ))}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

ViewReportPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ViewReportPage;
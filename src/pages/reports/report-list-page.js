import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
} from '@mui/material';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Layout from '../../layouts';
import { useRouter } from 'next/router';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useUser } from '../../contexts/UserContext';

const ReportListPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const q = query(collection(db, 'Reports'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reportList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let mainTitle = '제목 없음';

        if (data.content) {
          const lines = data.content.split('\n');
          const titleLine = lines.find((line) => line.trim().startsWith('# '));
          if (titleLine) {
            mainTitle = titleLine.trim().slice(2).trim(); // Remove '# ' and trim
          }
        }

        return {
          id: doc.id,
          ...data,
          mainTitle,
        };
      });
      setReports(reportList);
    } catch (error) {
      console.error('보고서 목록 로딩 오류:', error);
      // 여기에 사용자에게 오류를 알리는 로직을 추가할 수 있습니다.
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = (reportId) => {
    router.push(`/reports/view?id=${reportId}`);
  };

  const handleDeleteClick = (report, event) => {
    event.stopPropagation();
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (reportId, event) => {
    event.stopPropagation();
    router.push(`/reports/edit?id=${reportId}`);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (reportToDelete) {
      try {
        await deleteDoc(doc(db, 'Reports', reportToDelete.id));
        setDeleteDialogOpen(false);
        setReportToDelete(null);
        fetchReports(); // 목록 새로고침
      } catch (error) {
        console.error('보고서 삭제 오류:', error);
      }
    }
  };


  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          보고서 목록 로딩 중...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom color="primary" align="center">
        보고서 목록
      </Typography>
      <Box sx={{ mt: 3 }}>
        {reports.map((report) => (
          <Card
            key={report.id}
            sx={{
              mb: 2,
              boxShadow: 3,
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                boxShadow: 6,
              },
            }}
            onClick={() => handleReportClick(report.id)}
          >
            <CardContent>
              <Typography variant="h6" component="div">
                {report.mainTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ position: 'absolute', top: 16, right: 16 }}>
                작성자: {report.authorName || '알 수 없음'}
              </Typography>
            </CardContent>
            {user && user.uid === report.authorUid && (
              <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                <IconButton
                  onClick={(e) => handleEditClick(report.id, e)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon color="primary" />
                </IconButton>
                <IconButton
                  onClick={(e) => handleDeleteClick(report, e)}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </Box>
            )}
          </Card>
        ))}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'보고서 삭제 확인'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            정말로 이 보고서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

ReportListPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ReportListPage;

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../../utils/firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';

const ChecklistList = ({ storeId }) => {
  const [checklists, setChecklists] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (storeId) {
      const fetchChecklists = async () => {
        const checklistsRef = collection(db, 'Checklists');
        const q = query(checklistsRef, where('storeId', '==', storeId));
        const querySnapshot = await getDocs(q);
        const checklistList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setChecklists(checklistList);
      };
      fetchChecklists();
    }
  }, [storeId]);

  const handleDelete = async (checklistId) => {
    if (confirm('정말로 이 체크리스트를 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'Checklists', checklistId));
        setChecklists(checklists.filter((cl) => cl.id !== checklistId));
        alert('체크리스트가 삭제되었습니다.');
      } catch (error) {
        console.error('체크리스트 삭제 중 오류 발생:', error);
        alert('체크리스트 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCardClick = (checklist) => {
    router.push({
      pathname: `/stores/${storeId}/checklists/${checklist.id}`,
      query: { checklist: JSON.stringify(checklist) },
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          체크리스트 목록
        </Typography>
        <Link href={`/stores/${storeId}/checklists/add`} passHref>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ borderRadius: 28 }}>
            새 체크리스트
          </Button>
        </Link>
      </Box>
      <Grid container spacing={3}>
        {checklists.map((checklist) => (
          <Grid item xs={12} sm={6} md={4} key={checklist.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 },
              }}
              onClick={() => handleCardClick(checklist)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ListAltIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
                    {checklist.items[0]}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Chip label={checklist.category} size="small" color="secondary" sx={{ mt: 1 }} />
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton
                  aria-label="edit"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/stores/${storeId}/checklists/${checklist.id}/edit`);
                  }}
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  aria-label="delete"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(checklist.id);
                  }}
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {checklists.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography variant="body1" color="text.secondary">
            등록된 체크리스트가 없습니다.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

ChecklistList.propTypes = {
  storeId: PropTypes.string.isRequired,
};

export default ChecklistList;

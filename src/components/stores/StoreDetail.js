// components/stores/StoreDetail.js
import React from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ChecklistIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PropTypes from 'prop-types';

const StoreDetail = ({ store }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // 여기에 복사 성공 시 처리할 로직을 추가할 수 있습니다.
      console.log('텍스트가 클립보드에 복사되었습니다.');
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
            {store.name}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                <strong>위치:</strong> {store.location}
              </Typography>
              <Tooltip title="위치 복사">
                <IconButton onClick={() => copyToClipboard(store.location)} size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1">
              <strong>연락처:</strong> {store.contactInfo}
            </Typography>
            <Typography variant="body1">
              <strong>유형:</strong> {store.type}
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Link href={`/stores/${store.id}/edit`} passHref>
            <Button variant="outlined" startIcon={<EditIcon />} color="primary">
              수정
            </Button>
          </Link>
          <Link href={`/stores/${store.id}/checklists`} passHref>
            <Button
              variant="contained"
              startIcon={<ChecklistIcon />}
              color="secondary"
              size="large"
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              체크리스트 보기
            </Button>
          </Link>
        </CardActions>
      </Card>
    </Container>
  );
};

StoreDetail.propTypes = {
  store: PropTypes.object.isRequired,
};

export default StoreDetail;

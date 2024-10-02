// components/stores/ChecklistDetail.js
import React from 'react';
import Link from 'next/link';
import { Container, Typography, Button, Grid, Card, CardContent, CardActions, Chip, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ChecklistIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import PropTypes from 'prop-types';

const ChecklistDetail = ({ checklist, storeId, checklistId: propChecklistId }) => {
  const checklistId = propChecklistId || '체크리스트 ID 없음';

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" component="div" gutterBottom>
            {checklist.name}
          </Typography>
          <Chip icon={<CategoryIcon />} label={checklist.category} color="primary" variant="outlined" sx={{ mb: 2 }} />
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {checklist.items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body1">
                      <strong>{item.split(':')[0]}:</strong> {item.split(':')[1].replace(/[{}]/g, '')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Link href={`/stores/${storeId}/checklists/${checklistId}/edit`} passHref>
            <Button variant="contained" color="primary" startIcon={<EditIcon />}>
              수정
            </Button>
          </Link>
          <Link href={`/stores/${storeId}/checklists/${checklistId}/response`} passHref>
            <Button variant="contained" color="secondary" startIcon={<ChecklistIcon />}>
              응답 작성
            </Button>
          </Link>
          <Link href={`/stores/${storeId}/checklists/${checklistId}/reports`} passHref>
            <Button variant="contained" color="info" startIcon={<AssessmentIcon />}>
              보고서 보기
            </Button>
          </Link>
        </CardActions>
      </Card>
    </Container>
  );
};

ChecklistDetail.propTypes = {
  checklist: PropTypes.object.isRequired,
  storeId: PropTypes.string.isRequired,
  checklistId: PropTypes.string.isRequired,
};

export default ChecklistDetail;

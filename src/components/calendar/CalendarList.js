import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import { db } from '../../utils/firebase';

const CalendarList = () => {
  return (
    <Box mt={5}>
      <Typography variant="h4" gutterBottom>
        캘린더
      </Typography>
    </Box>
  );
};

export default CalendarList;

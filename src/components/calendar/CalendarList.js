import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/router';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const CalendarList = ({ events, fetchEvents, warehouses, partners, selectedDate }) => {
  const router = useRouter();

  const handleAddShipping = (partner) => {
    router.push({
      pathname: '/shipping/add',
      query: {
        partnerId: partner.id,
        partnerName: partner.name,
        lastShippingDate: partner.lastShippingDate || '',
        lastPalletQuantity: partner.lastPalletQuantity || '0',
        lastTotalQuantity: partner.lastTotalQuantity || '0',
      },
    });
  };

  const deleteEvent = async (id) => {
    await deleteDoc(doc(db, 'events', id));
    fetchEvents();
  };

  const filteredEvents = events.filter(event => {
    return !selectedDate || dayjs(event.date).isSame(selectedDate, 'day');
  });

  return (
    <Box>
      <List>
        {filteredEvents.map((event) => {
          const partner = partners.find((p) => p.id === event.partnerId);
          const warehouse = warehouses.find((w) => w.id === event.warehouseId);

          return (
            <ListItem
              key={event.id}
              sx={{
                borderBottom: '1px solid #ddd',
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <ListItemText
                primary={warehouse?.name || 'N/A'}
                sx={{ flex: 1, whiteSpace: 'normal', wordWrap: 'break-word' }}
              />
              <ListItemText
                primary={partner?.name || 'N/A'}
                sx={{ flex: 1, whiteSpace: 'normal', wordWrap: 'break-word' }}
              />
              <ListItemText
                primary={event.content}
                sx={{ flex: 1, whiteSpace: 'normal', wordWrap: 'break-word' }}
              />
              <ListItemText
                primary={dayjs(event.date).format('YYYY-MM-DD')}
                sx={{ flex: 1, whiteSpace: 'normal', wordWrap: 'break-word' }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddShipping(partner)}
                >
                  출고등록
                </Button>
                <IconButton edge="end" aria-label="delete" onClick={() => deleteEvent(event.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

CalendarList.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchEvents: PropTypes.func.isRequired,
  warehouses: PropTypes.arrayOf(PropTypes.object).isRequired,
  partners: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedDate: PropTypes.string,
};

export default CalendarList;

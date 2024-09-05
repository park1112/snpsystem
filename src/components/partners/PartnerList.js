import { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TableContainer,
  Paper,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SortableTableHeader from '../SortableTableHeader';

const PartnerList = () => {
  const [partners, setPartners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [orderDirection, setOrderDirection] = useState('asc');
  const router = useRouter();

  useEffect(() => {
    const fetchPartners = async () => {
      const querySnapshot = await getDocs(collection(db, 'partners'));
      const partnersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        };
      });
      setPartners(partnersData);
    };

    fetchPartners();
  }, []);

  const filteredPartners = partners.filter((partner) => partner.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDeletePartner = async (id) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      await deleteDoc(doc(db, 'partners', id));
      setPartners(partners.filter((partner) => partner.id !== id));
    }
  };

  const handleSort = (property, direction) => {
    setOrderBy(property);
    setOrderDirection(direction);
  };

  const sortedPartners = [...filteredPartners].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return orderDirection === 'asc' ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return orderDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'category', label: 'Category' },
    { id: 'master', label: '담당자' },
    { id: 'phone', label: 'Phone' },
    { id: 'address', label: '주소' },
    { id: 'paymentMethod', label: '계좌번호' },
  ];

  return (
    <Box mt={5}>
      <Typography variant="h4" gutterBottom>
        거래처
      </Typography>
      <TextField
        label="Search Partners"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
        fullWidth
        sx={{ mb: 3 }}
      />
      <Button variant="contained" color="primary" onClick={() => router.push('/partners/add')} sx={{ mb: 3 }}>
        거래처 추가
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <SortableTableHeader
                columns={columns}
                orderBy={orderBy}
                orderDirection={orderDirection}
                onSort={handleSort}
              />
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPartners.map((partner, index) => (
              <TableRow
                key={partner.id}
                sx={{
                  backgroundColor: index % 2 === 1 ? 'rgba(240, 240, 240, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)', cursor: 'pointer' },
                }}
                onClick={() => router.push(`/partners/${partner.id}`)}
              >
                <TableCell>{partner.name}</TableCell>
                <TableCell>{partner.category}</TableCell>
                <TableCell>{partner.master}</TableCell>
                <TableCell>{partner.phone}</TableCell>
                <TableCell>{partner.address}</TableCell>
                <TableCell>{partner.paymentMethod}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/partners/${partner.id}/edit`);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePartner(partner.id);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PartnerList;

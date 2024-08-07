import { useState, useEffect } from 'react';
import { TextField, Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, TableContainer, Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SortableTableHeader from '../SortableTableHeader';
import StatusChip from '../StatusChip';

const TeamList = () => {
    const [teams, setTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('name');
    const [orderDirection, setOrderDirection] = useState('asc');
    const router = useRouter();

    useEffect(() => {
        const fetchTeams = async () => {
            const querySnapshot = await getDocs(collection(db, 'teams'));
            const teamsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
                };
            });
            setTeams(teamsData);
        };

        fetchTeams();
    }, []);

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteTeam = async (id) => {
        if (confirm('Are you sure you want to delete this team?')) {
            await deleteDoc(doc(db, 'teams', id));
            setTeams(teams.filter(team => team.id !== id));
        }
    };

    const handleSort = (property, direction) => {
        setOrderBy(property);
        setOrderDirection(direction);
    };

    const sortedTeams = [...filteredTeams].sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return orderDirection === 'asc' ? -1 : 1;
        if (a[orderBy] > b[orderBy]) return orderDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const columns = [
        { id: 'name', label: 'Name' },
        { id: 'master', label: 'Master' },
        { id: 'phone', label: 'Phone' },
        { id: 'status', label: 'Status' }
    ];

    return (
        <Box mt={5}>
            <Typography variant="h4" gutterBottom>Teams</Typography>
            <TextField
                label="Search Teams"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                margin="normal"
                fullWidth
            />
            <Button variant="contained" color="primary" onClick={() => router.push('/teams/add')} sx={{ mt: 2, mb: 2 }}>
                Add Team
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
                        {sortedTeams.map((team, index) => (
                            <TableRow
                                key={team.id}
                                sx={{
                                    backgroundColor: index % 2 === 1 ? 'rgba(240, 240, 240, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                                    '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)', cursor: 'pointer' }
                                }}
                            >
                                <TableCell onClick={() => router.push(`/teams/${team.id}`)}>{team.name}</TableCell>
                                <TableCell onClick={() => router.push(`/teams/${team.id}`)}>{team.master}</TableCell>
                                <TableCell onClick={() => router.push(`/teams/${team.id}`)}>{team.phone}</TableCell>
                                <TableCell onClick={() => router.push(`/teams/${team.id}`)}>
                                    <StatusChip status={team.status} />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={(e) => { e.stopPropagation(); router.push(`/teams/${team.id}/edit`); }}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id); }}>
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

export default TeamList;

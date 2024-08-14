import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Button, Select, MenuItem } from '@mui/material';
import { db } from '../../utils/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import NotificationDialog from './NotificationDialog';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [openNotification, setOpenNotification] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: newRole });
            setUsers(users.map(user => (user.id === userId ? { ...user, role: newRole } : user)));
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const handleOpenNotification = (user) => {
        setSelectedUser(user);
        setOpenNotification(true);
    };

    const handleCloseNotification = () => {
        setOpenNotification(false);
        setSelectedUser(null);
    };

    return (
        <Paper sx={{ mt: 5, p: 2 }}>
            <Typography variant="h6" gutterBottom>
                회원 관리
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>이메일</TableCell>
                        <TableCell>이름</TableCell>
                        <TableCell>등급</TableCell>
                        <TableCell>설정</TableCell>
                        <TableCell>알림</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>
                                <Select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                >
                                    <MenuItem value="user">User</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Button variant="contained" color="secondary" onClick={() => handleRoleChange(user.id, 'banned')}>
                                    차단
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button variant="contained" color="primary" onClick={() => handleOpenNotification(user)}>
                                    알림 보내기
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <NotificationDialog
                open={openNotification}
                onClose={handleCloseNotification}
                user={selectedUser}
                allUsers={users}
            />
        </Paper>
    );
};

export default AdminPage;
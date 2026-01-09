import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    TextField,
    InputAdornment,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    Grid,
    Alert
} from '@mui/material';
import {
    Search,
    Refresh,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon,
    FilterList,
    Lock as LockIcon
} from '@mui/icons-material';
import { collection, getDocs, query, orderBy, limit, where, startAfter } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { ACTION_LABELS, CATEGORY_LABELS } from '../../utils/activityLogger';
import { useUser } from '../../contexts/UserContext';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

const ActivityLogsPage = () => {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // 통계 데이터
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        creates: 0,
        updates: 0,
        deletes: 0,
        downloads: 0
    });

    // Admin 권한 체크
    const isAdmin = user?.role === 'admin';

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const logsQuery = query(
                collection(db, 'activity_logs'),
                orderBy('createdAt', 'desc'),
                limit(500)
            );
            const querySnapshot = await getDocs(logsQuery);
            const logsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || null,
            }));

            setLogs(logsData);

            // 통계 계산
            const today = dayjs().startOf('day');
            const todayLogs = logsData.filter(log =>
                log.createdAt && dayjs(log.createdAt).isAfter(today)
            );

            setStats({
                total: logsData.length,
                today: todayLogs.length,
                creates: logsData.filter(l => l.action === 'CREATE').length,
                updates: logsData.filter(l => l.action === 'UPDATE').length,
                deletes: logsData.filter(l => l.action === 'DELETE').length,
                downloads: logsData.filter(l => l.action === 'DOWNLOAD').length
            });
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchLogs();
        } else {
            setLoading(false);
        }
    }, [fetchLogs, isAdmin]);

    // 필터링된 로그
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = searchTerm === '' ||
                (log.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.targetName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.userName?.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
            const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;

            return matchesSearch && matchesAction && matchesCategory;
        });
    }, [logs, searchTerm, actionFilter, categoryFilter]);

    // 페이지네이션된 로그
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLogs, currentPage]);

    // 액션 아이콘 및 색상
    const getActionIcon = (action) => {
        switch (action) {
            case 'CREATE':
                return <AddIcon fontSize="small" />;
            case 'UPDATE':
                return <EditIcon fontSize="small" />;
            case 'DELETE':
                return <DeleteIcon fontSize="small" />;
            case 'DOWNLOAD':
                return <DownloadIcon fontSize="small" />;
            case 'VIEW':
                return <ViewIcon fontSize="small" />;
            default:
                return null;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE':
                return { bg: '#dcfce7', color: '#16a34a' };
            case 'UPDATE':
                return { bg: '#dbeafe', color: '#2563eb' };
            case 'DELETE':
                return { bg: '#fee2e2', color: '#dc2626' };
            case 'DOWNLOAD':
                return { bg: '#f3e8ff', color: '#9333ea' };
            case 'VIEW':
                return { bg: '#f1f5f9', color: '#64748b' };
            default:
                return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    // 통계 카드 컴포넌트
    const StatCard = ({ title, value, color, icon }) => (
        <Card sx={{
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid #e2e8f0',
            height: '100%'
        }}>
            <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            {title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: color || '#374151', mt: 0.5 }}>
                            {value}
                        </Typography>
                    </Box>
                    {icon && (
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: `${color}15`
                        }}>
                            {icon}
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );

    // 사용자 로딩 중
    if (userLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    // Admin 권한이 없는 경우
    if (!isAdmin) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: '1px solid #fee2e2',
                        backgroundColor: '#fef2f2'
                    }}
                >
                    <LockIcon sx={{ fontSize: 64, color: '#ef4444', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626', mb: 1 }}>
                        접근 권한이 없습니다
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#991b1b', mb: 3 }}>
                        이 페이지는 관리자만 접근할 수 있습니다.
                    </Typography>
                    <Alert severity="warning" sx={{ maxWidth: 400, mx: 'auto' }}>
                        현재 계정: {user?.email || '알 수 없음'}<br />
                        권한: {user?.role || 'user'}
                    </Alert>
                </Paper>
            </Box>
        );
    }

    // 로그 로딩 중
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#374151' }}>
                        활동 로그
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                        시스템 활동 내역을 확인합니다
                    </Typography>
                </Box>
                <Tooltip title="새로고침">
                    <IconButton onClick={fetchLogs} sx={{
                        bgcolor: '#f1f5f9',
                        '&:hover': { bgcolor: '#e2e8f0' }
                    }}>
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* 통계 카드 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4} md={2}>
                    <StatCard
                        title="전체 로그"
                        value={stats.total}
                        color="#374151"
                    />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <StatCard
                        title="오늘"
                        value={stats.today}
                        color="#667eea"
                    />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <StatCard
                        title="등록"
                        value={stats.creates}
                        color="#16a34a"
                        icon={<AddIcon sx={{ color: '#16a34a' }} />}
                    />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <StatCard
                        title="수정"
                        value={stats.updates}
                        color="#2563eb"
                        icon={<EditIcon sx={{ color: '#2563eb' }} />}
                    />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <StatCard
                        title="삭제"
                        value={stats.deletes}
                        color="#dc2626"
                        icon={<DeleteIcon sx={{ color: '#dc2626' }} />}
                    />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <StatCard
                        title="다운로드"
                        value={stats.downloads}
                        color="#9333ea"
                        icon={<DownloadIcon sx={{ color: '#9333ea' }} />}
                    />
                </Grid>
            </Grid>

            {/* 필터 영역 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="검색 (내용, 이름, 사용자)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{
                        minWidth: 280,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8fafc',
                            '&:hover': { backgroundColor: '#f1f5f9' },
                            '&.Mui-focused': { backgroundColor: 'white' }
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: '#9ca3af' }} />
                            </InputAdornment>
                        )
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>액션</InputLabel>
                    <Select
                        value={actionFilter}
                        label="액션"
                        onChange={(e) => setActionFilter(e.target.value)}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="ALL">전체</MenuItem>
                        <MenuItem value="CREATE">등록</MenuItem>
                        <MenuItem value="UPDATE">수정</MenuItem>
                        <MenuItem value="DELETE">삭제</MenuItem>
                        <MenuItem value="DOWNLOAD">다운로드</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>카테고리</InputLabel>
                    <Select
                        value={categoryFilter}
                        label="카테고리"
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="ALL">전체</MenuItem>
                        <MenuItem value="daily_summaries">출고상품</MenuItem>
                        <MenuItem value="products">상품</MenuItem>
                        <MenuItem value="markets">마켓</MenuItem>
                    </Select>
                </FormControl>

                <Chip
                    label={`${filteredLogs.length}건`}
                    size="small"
                    sx={{
                        alignSelf: 'center',
                        backgroundColor: '#e0e7ff',
                        color: '#4f46e5',
                        fontWeight: 600
                    }}
                />
            </Box>

            {/* 테이블 */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    mb: 3
                }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5, width: '180px' }}>
                                시간
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5, width: '100px' }}>
                                액션
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5, width: '100px' }}>
                                카테고리
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5 }}>
                                내용
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5, width: '120px' }}>
                                대상
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5, width: '100px' }}>
                                사용자
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
                                    <Typography variant="body1">로그가 없습니다</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedLogs.map((log, index) => {
                                const actionColors = getActionColor(log.action);
                                return (
                                    <TableRow
                                        key={log.id}
                                        sx={{
                                            backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc',
                                            '&:hover': { backgroundColor: '#f0f4ff' }
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem', color: '#6b7280' }}>
                                            {log.createdAt
                                                ? dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')
                                                : 'N/A'
                                            }
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                icon={getActionIcon(log.action)}
                                                label={ACTION_LABELS[log.action] || log.action}
                                                size="small"
                                                sx={{
                                                    backgroundColor: actionColors.bg,
                                                    color: actionColors.color,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    '& .MuiChip-icon': { color: actionColors.color }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem', color: '#374151' }}>
                                            {CATEGORY_LABELS[log.category] || log.category}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem', color: '#374151' }}>
                                            {log.description}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem', color: '#667eea', fontWeight: 500 }}>
                                            {log.targetName || '-'}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem', color: '#6b7280' }}>
                                            {log.userName || '-'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 페이지네이션 */}
            {filteredLogs.length > itemsPerPage && (
                <Box display="flex" justifyContent="center">
                    <Pagination
                        count={Math.ceil(filteredLogs.length / itemsPerPage)}
                        page={currentPage}
                        onChange={(e, v) => setCurrentPage(v)}
                        shape="rounded"
                        showFirstButton
                        showLastButton
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: 2,
                                fontWeight: 500,
                                '&.Mui-selected': {
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                }
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default ActivityLogsPage;

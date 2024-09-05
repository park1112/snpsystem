import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Button, Card, CardContent, CardActions,
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, Collapse, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useUser } from '../../contexts/UserContext';

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

export default function VersionHistoryPage() {
    const [versions, setVersions] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newVersion, setNewVersion] = useState({ version: '', description: '', changes: '' });
    const [expanded, setExpanded] = useState({});
    const { user } = useUser();

    useEffect(() => {
        fetchVersions();
    }, []);

    const fetchVersions = async () => {
        const q = query(collection(db, 'versions'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const versionList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVersions(versionList);
    };

    const handleAddVersion = async () => {
        const changesArray = newVersion.changes.split('\n').filter(change => change.trim() !== '');
        await addDoc(collection(db, 'versions'), {
            ...newVersion,
            changes: changesArray,
            timestamp: Timestamp.now()
        });
        setOpenDialog(false);
        setNewVersion({ version: '', description: '', changes: '' });
        fetchVersions();
    };

    const handleExpandClick = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const isMaster = user && user.role === 'master';

    const renderChanges = (changes) => {
        if (Array.isArray(changes)) {
            return (
                <List>
                    {changes.map((change, index) => (
                        <ListItem key={index}>
                            <ListItemIcon>
                                <FiberManualRecordIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={change} />
                        </ListItem>
                    ))}
                </List>
            );
        } else if (typeof changes === 'string') {
            return (
                <Typography paragraph>
                    {changes.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </Typography>
            );
        }
        return null;
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    버전 히스토리
                </Typography>
                {isMaster && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        새 버전 추가
                    </Button>
                )}
            </Box>

            <Timeline position="alternate">
                {versions.map((version, index) => (
                    <TimelineItem key={version.id}>
                        <TimelineOppositeContent color="text.secondary">
                            {version.timestamp.toDate().toLocaleDateString()}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot color={index === 0 ? "secondary" : "primary"} />
                            {index !== versions.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        버전 {version.version}
                                        {index === 0 && (
                                            <Chip label="최신" color="secondary" size="small" sx={{ ml: 1 }} />
                                        )}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {version.description}
                                    </Typography>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <ExpandMore
                                        expand={expanded[version.id]}
                                        onClick={() => handleExpandClick(version.id)}
                                        aria-expanded={expanded[version.id]}
                                        aria-label="show more"
                                    >
                                        <ExpandMoreIcon />
                                    </ExpandMore>
                                </CardActions>
                                <Collapse in={expanded[version.id]} timeout="auto" unmountOnExit>
                                    <CardContent>
                                        <Typography paragraph>변경사항:</Typography>
                                        {renderChanges(version.changes)}
                                    </CardContent>
                                </Collapse>
                            </Card>
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>새 버전 추가</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="버전"
                        fullWidth
                        value={newVersion.version}
                        onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="설명"
                        fullWidth
                        value={newVersion.description}
                        onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="변경사항 (각 항목을 새 줄에 입력하세요)"
                        fullWidth
                        multiline
                        rows={4}
                        value={newVersion.changes}
                        onChange={(e) => setNewVersion({ ...newVersion, changes: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>취소</Button>
                    <Button onClick={handleAddVersion}>추가</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
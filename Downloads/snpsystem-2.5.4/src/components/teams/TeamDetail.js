import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const TeamDetail = ({ teamId }) => {
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeam = async () => {
            setLoading(true);
            try {
                const teamDoc = await getDoc(doc(db, 'teams', teamId));
                if (teamDoc.exists()) {
                    setTeam(teamDoc.data());
                } else {
                    setError('Team not found');
                }
            } catch (err) {
                setError('Failed to fetch team');
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTeam();
        }
    }, [teamId]);

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }

    return (
        <Box mt={5}>
            {team ? (
                <>
                    <Typography variant="h4">{team.name} 팀</Typography>
                    <Typography variant="h6">담당자: {team.master}</Typography>
                    <Typography variant="h6">Phone: {team.phone}</Typography>
                    <Typography variant="h6">Account Number: {team.accountNumber}</Typography>
                    <Typography variant="h6">Created By: {team.createdBy}</Typography>
                    <Typography variant="h6">Updated By: {team.updatedBy}</Typography>
                </>
            ) : (
                <Typography variant="h6">No team data available</Typography>
            )}
        </Box>
    );
};

export default TeamDetail;

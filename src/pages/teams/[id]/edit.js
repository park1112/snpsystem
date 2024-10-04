import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';
import TeamForm from '../../../components/teams/TeamForm';

const EditTeamPage = () => {
    const router = useRouter();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const { id } = router.query;

        if (!id) {
            setError('No ID found in query');
            setLoading(false);
            return;
        }

        const fetchTeam = async () => {
            try {
                const teamDoc = await getDoc(doc(db, 'teams', id));
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

        fetchTeam();
    }, [router.isReady, router.query]);

    const handleUpdateTeam = async (updatedTeam) => {
        const { id } = router.query;
        const now = new Date().toISOString();
        try {
            await updateDoc(doc(db, 'teams', id), {
                ...updatedTeam,
                updatedAt: now,
                createdAt: updatedTeam.createdAt || now
            });
            router.push(`/teams/${id}`);
        } catch (err) {
            setError('Failed to update team');
        }
    };

    if (loading) {
        return (
            <Layout>
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Layout>
        );
    }

    return (
        <Layout>
            <Box mt={5}>
                <Typography variant="h4">Edit Team</Typography>
                <TeamForm initialData={team} onSubmit={handleUpdateTeam} />
            </Box>
        </Layout>
    );
};

export default EditTeamPage;

import React, { useState } from 'react';
import { Container, TextField, Button, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const CreateLog = () => {
    const today = new Date().toISOString().split('T')[0];

    const [date, setDate] = useState(today);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [mainTask, setMainTask] = useState('');
    const [status, setStatus] = useState('진행 중');  // 기본값: 진행 중
    const [note, setNote] = useState('');
    const [timeSpent, setTimeSpent] = useState('');
    const [goal, setGoal] = useState('');
    const [category, setCategory] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        await addDoc(collection(db, 'daily_logs'), {
            date,
            startTime,
            endTime,
            mainTask,
            status,
            note,
            timeSpent,
            goal,
            category,
        });
        router.push('/work-log');
    };

    return (
        <Container maxWidth="sm">
            <TextField
                label="날짜"
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                margin="normal"
            />
            <TextField
                label="시작 시간"
                type="time"
                fullWidth
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                margin="normal"
            />
            <TextField
                label="종료 시간"
                type="time"
                fullWidth
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                margin="normal"
            />
            <TextField
                label="주요 작업"
                fullWidth
                value={mainTask}
                onChange={(e) => setMainTask(e.target.value)}
                margin="normal"
            />
            <TextField
                label="소요 시간 (시간 또는 분)"
                fullWidth
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                margin="normal"
            />
            <TextField
                label="진행 상태"
                select
                fullWidth
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                margin="normal"
            >
                <MenuItem value="진행 중">진행 중</MenuItem>
                <MenuItem value="완료">완료</MenuItem>
                <MenuItem value="미착수">미착수</MenuItem>
            </TextField>
            <TextField
                label="메모/문제점"
                fullWidth
                value={note}
                onChange={(e) => setNote(e.target.value)}
                margin="normal"
            />
            <TextField
                label="목표 또는 다음 단계"
                fullWidth
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                margin="normal"
            />
            <TextField
                label="카테고리 태그"
                fullWidth
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleSubmit}>저장</Button>
        </Container>
    );
};

export default CreateLog;

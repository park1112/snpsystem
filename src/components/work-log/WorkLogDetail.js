import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Button } from '@mui/material';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import * as XLSX from 'xlsx';

const WorkLogDetail = () => {
    const [log, setLog] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (id) {
            const fetchLog = async () => {
                const docRef = doc(db, 'daily_logs', id);
                const docSnap = await getDoc(docRef);
                setLog(docSnap.data());
            };
            fetchLog();
        }
    }, [id]);

    if (!log) return <Typography>Loading...</Typography>;

    const handleDelete = async () => {
        if (id) {
            try {
                await deleteDoc(doc(db, 'daily_logs', id));
                alert('업무일지가 삭제되었습니다.');
                router.push('/work-log');
            } catch (error) {
                console.error('삭제 중 오류 발생:', error);
                alert('삭제 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        }
    };

    const downloadExcel = () => {
        const worksheetData = [
            ["날짜", log.date],
            ["시작 시간", log.startTime || 'N/A'],
            ["종료 시간", log.endTime || 'N/A'],
            ["주요 작업", log.mainTask],
            ["진행 상태", log.status],
            ["소요 시간", log.timeSpent || 'N/A'],
            ["카테고리", log.category || 'N/A'],
            ["메모", log.note || 'N/A'],
            ["목표", log.goal || 'N/A']
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'WorkLogDetail');

        const fileName = `WorkLog_${log.date}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const downloadPDF = async () => {
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();

            doc.text(`날짜: ${log.date}`, 10, 10);
            doc.text(`시작 시간: ${log.startTime || 'N/A'}`, 10, 20);
            doc.text(`종료 시간: ${log.endTime || 'N/A'}`, 10, 30);
            doc.text(`주요 작업: ${log.mainTask}`, 10, 40);
            doc.text(`진행 상태: ${log.status}`, 10, 50);
            doc.text(`소요 시간: ${log.timeSpent || 'N/A'}`, 10, 60);
            doc.text(`카테고리: ${log.category || 'N/A'}`, 10, 70);
            doc.text(`메모: ${log.note || 'N/A'}`, 10, 80);
            doc.text(`목표: ${log.goal || 'N/A'}`, 10, 90);

            doc.save(`WorkLog_${log.date}.pdf`);
        } catch (error) {
            console.error('PDF 생성 중 오류 발생:', error);
            alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4">{log.date}</Typography>
            <Typography variant="h6">시작 시간: {log.startTime || 'N/A'}</Typography>
            <Typography variant="h6">종료 시간: {log.endTime || 'N/A'}</Typography>
            <Typography variant="h6">주요 작업: {log.mainTask}</Typography>
            <Typography variant="h6">진행 상태: {log.status}</Typography>
            <Typography variant="h6">소요 시간: {log.timeSpent || 'N/A'}</Typography>
            <Typography variant="h6">카테고리: {log.category || 'N/A'}</Typography>
            <Typography variant="h6">메모: {log.note || 'N/A'}</Typography>
            <Typography variant="h6">목표: {log.goal || 'N/A'}</Typography>
            <Button variant="contained" color="primary" onClick={() => router.push(`../edit/${id}`)}>수정</Button>
            <Button variant="contained" color="secondary" onClick={handleDelete}>삭제</Button>
            <Button variant="contained" onClick={downloadExcel}>엑셀 다운로드</Button>
            <Button variant="contained" onClick={downloadPDF}>PDF 다운로드</Button>
        </Container>
    );
};

export default WorkLogDetail;

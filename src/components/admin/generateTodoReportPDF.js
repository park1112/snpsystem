import dayjs from 'dayjs';
import { loadFont } from '../../utils/fontLoader';

const generateTodoReportPDF = async (data) => {
    const { date, overallStats, userTodos, overallChartUrl, userChartUrl } = data;

    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    await import('jspdf-autotable');

    let fontBase64;
    try {
        fontBase64 = await loadFont('NanumGothic.ttf');
    } catch (error) {
        console.error('폰트 로딩 오류:', error);
        fontBase64 = null;
    }

    const doc = new jsPDF();

    if (fontBase64) {
        doc.addFileToVFS('NanumGothic.ttf', fontBase64);
        doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
        doc.setFont('NanumGothic');
    }

    // Title
    doc.setFontSize(20);
    doc.text('전체 사용자 할 일 보고서', 14, 20);

    // Date
    doc.setFontSize(12);
    doc.text(`날짜: ${date}`, 14, 30);

    // Overall Statistics
    doc.setFontSize(14);
    doc.text('전체 통계', 14, 40);
    doc.setFontSize(12);
    doc.text(`총 사용자 수: ${overallStats.totalUsers}`, 14, 50);
    doc.text(`총 할 일 수: ${overallStats.totalTodos}`, 14, 55);
    doc.text(`완료된 할 일 수: ${overallStats.completedTodos}`, 14, 60);
    doc.text(`전체 완료율: ${overallStats.overallCompletionRate.toFixed(2)}%`, 14, 65);

    // Charts
    const chartWidth = 90;  // 차트 너비 조정
    const chartHeight = 70; // 차트 높이 조정
    const chartY = 75;      // 차트 Y 좌표

    if (overallChartUrl) {
        doc.addImage(overallChartUrl, 'PNG', 14, chartY, chartWidth, chartHeight);
    }
    if (userChartUrl) {
        doc.addImage(userChartUrl, 'PNG', 110, chartY, chartWidth, chartHeight);
    }

    // User Todo Lists
    doc.addPage();
    doc.setFontSize(16);
    doc.text('사용자별 할 일 목록', 14, 20);

    let yPosition = 30;

    Object.entries(userTodos).forEach(([userId, todos]) => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text(`${todos[0].userName}`, 14, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.text(`총 할 일 수: ${todos.length}`, 14, yPosition);
        yPosition += 5;
        doc.text(`완료된 할 일 수: ${todos.filter(todo => todo.completed).length}`, 14, yPosition);
        yPosition += 5;
        doc.text(`완료율: ${(todos.filter(todo => todo.completed).length / todos.length * 100).toFixed(2)}%`, 14, yPosition);
        yPosition += 10;

        doc.autoTable({
            head: [['제목', '상태', '생성일', '완료일', '유형', '할당자']],
            body: todos.map(todo => [
                todo.title,
                todo.completed ? '완료' : '미완료',
                dayjs(todo.createdAt.toDate()).format('YYYY-MM-DD'),
                todo.completed ? dayjs(todo.completedAt.toDate()).format('YYYY-MM-DD') : '-',
                todo.type === 'personal' ? '개인' : '할당됨',
                todo.type === 'assigned' ? todo.assignedByName : '-'
            ]),
            startY: yPosition,
            styles: fontBase64 ? { font: 'NanumGothic', fontSize: 8 } : { fontSize: 8 },
            headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
            bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        yPosition = doc.lastAutoTable.finalY + 20;
    });

    doc.save(`전체_사용자_할일_보고서_${date}.pdf`);
};

export default generateTodoReportPDF;
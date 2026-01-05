import dayjs from 'dayjs';
import { loadFont } from '../../utils/fontLoader';

const generateSummaryPDF = async (data) => {
    const { summary, totalQuantity, totalPrice, updatedAt, marketName } = data;

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

    doc.setFontSize(20);
    doc.text(`상세보기 - ${marketName || 'Unknown Market'}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`날짜: ${updatedAt ? dayjs(updatedAt.toDate()).format('YYYY-MM-DD HH:mm') : 'N/A'}`, 14, 30);
    doc.text(`총 수량: ${totalQuantity}`, 14, 35);
    doc.text(`총 합계가격: ${totalPrice.toLocaleString()} 원`, 14, 40);

    doc.autoTable({
        head: [['상품명', '총 수량', '박스 타입', '상품가격', '합계가격']],
        body: summary.map(item => [
            item.productName,
            item.totalQuantity,
            item.boxType,
            `${item.productPrice.toLocaleString()} 원`,
            `${item.totalPrice.toLocaleString()} 원`
        ]),
        startY: 50,
        styles: fontBase64 ? { font: 'NanumGothic', fontSize: 10 } : { fontSize: 10 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didParseCell: function (data) {
            if (data.section === 'body') {
                if (data.row.index % 2 === 1) {
                    data.cell.styles.fillColor = [245, 245, 245];
                } else {
                    data.cell.styles.fillColor = [255, 255, 255];
                }
            }
        },
    });

    const finalY = doc.lastAutoTable.finalY || 50;
    doc.text(`총 합계: ${totalPrice.toLocaleString()} 원`, 14, finalY + 10);

    doc.save(`${marketName || 'Unknown_Market'}_${updatedAt ? dayjs(updatedAt.toDate()).format('YYYY-MM-DD') : 'N/A'}`);
};

export default generateSummaryPDF;
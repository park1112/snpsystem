import React from 'react';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

const ExportToExcelButton = ({ totalSummary, reportData, marketNames, dateRange }) => {

    const formatNumber = (num) => (num || 0).toLocaleString();

    const handleExport = () => {
        const workbook = XLSX.utils.book_new();

        // 1) 총요약 시트 생성
        const totalHeaders = ["마켓", "총 판매수량", "반품수량", "총 판매금액", "반품금액", "정산금액"];
        const totalData = marketNames.map(market => {
            const q = totalSummary[market]?.quantity || 0;
            const rq = totalSummary[market]?.returnQuantity || 0;
            const a = totalSummary[market]?.amount || 0;
            const ra = totalSummary[market]?.returnAmount || 0;
            const settle = a - ra;
            return [
                market,
                formatNumber(q),
                formatNumber(rq),
                formatNumber(a),
                formatNumber(ra),
                formatNumber(settle)
            ];
        });

        // 총계 추가
        const totalQuantitySum = marketNames.reduce((sum, market) => sum + (totalSummary[market]?.quantity || 0), 0);
        const totalReturnQuantitySum = marketNames.reduce((sum, market) => sum + (totalSummary[market]?.returnQuantity || 0), 0);
        const totalAmountSum = marketNames.reduce((sum, market) => sum + (totalSummary[market]?.amount || 0), 0);
        const totalReturnAmountSum = marketNames.reduce((sum, market) => sum + (totalSummary[market]?.returnAmount || 0), 0);
        const totalSettlement = totalAmountSum - totalReturnAmountSum;

        totalData.push([
            "총계",
            formatNumber(totalQuantitySum),
            formatNumber(totalReturnQuantitySum),
            formatNumber(totalAmountSum),
            formatNumber(totalReturnAmountSum),
            formatNumber(totalSettlement)
        ]);

        const totalSheet = XLSX.utils.aoa_to_sheet([totalHeaders, ...totalData]);
        XLSX.utils.book_append_sheet(workbook, totalSheet, "총요약");

        // 2) 상세내역 시트 생성
        const detailHeaders = ["날짜", "마켓", "판매수량", "반품수량", "판매금액", "반품금액", "정산금액"];
        const detailData = [];

        reportData.forEach(dayData => {
            const currentDate = dayjs(dayData.date).format('YYYY년 MM월 DD일');
            // 각 날짜별 데이터 입력
            marketNames.forEach(market => {
                const q = dayData[market]?.quantity || 0;
                const rq = dayData[market]?.returnQuantity || 0;
                const a = dayData[market]?.amount || 0;
                const ra = dayData[market]?.returnAmount || 0;
                const settle = a - ra;

                detailData.push([
                    currentDate,
                    market,
                    formatNumber(q),
                    formatNumber(rq),
                    formatNumber(a),
                    formatNumber(ra),
                    formatNumber(settle)
                ]);
            });

            // 날짜별 총계 추가
            const dailyTotalQuantity = marketNames.reduce((sum, market) => sum + (dayData[market]?.quantity || 0), 0);
            const dailyTotalReturnQuantity = marketNames.reduce((sum, market) => sum + (dayData[market]?.returnQuantity || 0), 0);
            const dailyTotalAmount = marketNames.reduce((sum, market) => sum + (dayData[market]?.amount || 0), 0);
            const dailyTotalReturnAmount = marketNames.reduce((sum, market) => sum + (dayData[market]?.returnAmount || 0), 0);
            const dailySettle = dailyTotalAmount - dailyTotalReturnAmount;

            detailData.push([
                currentDate,
                "총계",
                formatNumber(dailyTotalQuantity),
                formatNumber(dailyTotalReturnQuantity),
                formatNumber(dailyTotalAmount),
                formatNumber(dailyTotalReturnAmount),
                formatNumber(dailySettle)
            ]);
        });

        const detailSheet = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailData]);
        XLSX.utils.book_append_sheet(workbook, detailSheet, "상세내역");

        // 엑셀 파일 다운로드
        const start = dateRange[0].format('YYYYMMDD');
        const end = dateRange[1].format('YYYYMMDD');
        const filename = `일자별_판매_반품_레포트_${start}_${end}.xlsx`;

        XLSX.writeFile(workbook, filename);
    };

    return (
        <Button variant="contained" color="secondary" onClick={handleExport} fullWidth>
            엑셀 다운로드
        </Button>
    );
};

export default ExportToExcelButton;

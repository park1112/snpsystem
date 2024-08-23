import React from 'react';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';
import Iconify from '../Iconify';

const ExcelDownloader = ({ itemList, productMappings, selectedMarket, markets }) => {
    const handleDownload = () => {
        if (!selectedMarket || !itemList[selectedMarket]) {
            alert('오픈마켓을 선택하고 파일을 업로드해주세요.');
            return;
        }

        const marketMapping = productMappings[selectedMarket] || {};
        const filteredData = itemList[selectedMarket]
            .filter(item => marketMapping[item.옵션ID || item.옵션정보 || item.상품번호 || item.옵션 || item.옵션번호])
            .map(item => {
                const mapping = marketMapping[item.옵션ID || item.옵션정보 || item.상품번호 || item.옵션 || item.옵션번호];
                return {
                    '예약구분': '',
                    '집하예정일': '',
                    '받는분성명': item.수취인이름 || item.수취인명 || item.주문자명 || item.수령인명,
                    '받는분전화번호': item.구매자전화번호 || item.수취인연락처1 || item.전화번호 || item['수령인 휴대폰'],
                    '받는분기타연락처': '',
                    '받는분우편번호': '',
                    '받는분주소': item['수취인 주소'] || item.통합배송지 || item.주소,
                    '운송장번호': '',
                    '고객주문번호': '',
                    '품목명': mapping.deliveryProductName,
                    '박스수량': item['구매수(수량)'] || item.수량 || item.구매수량,
                    '박스타입': mapping.boxType,
                    '기본운임': mapping.price,
                    '배송메세지1': item.배송메세지 || item.배송요청메모 || item.요청사항 || item['배송시 요구사항'],
                    '배송메세지2': '',
                };
            });

        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "배송정보");

        // 현재 한국 시간을 가져옵니다
        const now = new Date();
        now.setHours(now.getHours() + 9);  // UTC to KST

        // 날짜와 시간을 원하는 형식으로 포맷팅합니다
        const dateTime = now.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '');

        // 선택된 마켓의 이름을 가져옵니다
        const selectedMarketName = markets.find(market => market.id === selectedMarket)?.name || 'Unknown';

        // 파일 이름을 생성합니다
        const fileName = `${selectedMarketName}_배송정보_${dateTime}.xlsx`;

        XLSX.writeFile(wb, fileName);
    };


    return (
        <Button
            startIcon={<Iconify icon="ic:round-download" />}
            variant="contained"
            color="primary"
            size="large"
            onClick={handleDownload}
            disabled={!selectedMarket || !itemList[selectedMarket]}
        >
            택배자료 다운로드
        </Button>
    );
};

export default ExcelDownloader;
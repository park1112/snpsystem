import React, { useState } from 'react';
import { Container, Typography, Grid, Card, CardHeader, Button, CircularProgress } from '@mui/material';
import Layout from '../../layouts';
import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import create from 'zustand';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import CollapsibleTable from '../../components/table';
import Iconify from '../../components/Iconify';
import useFirestore from '../../hooks/useFirestore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const useStore = create((set) => ({
  count: 0,
  marketTotalCount: 0,
  marketSumTotalCount: 0,
  productCounts: {},
  productPrices: {},
  증가() {
    set((state) => ({ count: state.count + 1 }));
  },
  async ajax요청() {
    const response = await fetch('https://codingapple1.github.io/data.json');
    console.log(await response.json());
  },
}));

const filese = [];

const PageOne = () => {
  const { themeStretch } = useSettings();
  const { count, 증가, ajax요청, marketTotalCount, productCounts, productPrices } = useStore(state => ({
    count: state.count,
    증가: state.증가,
    ajax요청: state.ajax요청,
    marketTotalCount: state.marketTotalCount,
    productCounts: state.productCounts,
    productPrices: state.productPrices,
  }));

  const [itemList, setItemList] = useState({
    coupang: [],
    naver: [],
    gmarket: [],
    wemakeprice: [],
    tiket: [],
    st: [],
    interpark: [],
    lotte: [],
  });

  const { data: coupangData, loading: coupangLoading } = useFirestore('coupang');
  const { data: naverData, loading: naverLoading } = useFirestore('naver');
  const { data: gmarketData, loading: gmarketLoading } = useFirestore('gmarket');
  const { data: wemakepriceData, loading: wemakepriceLoading } = useFirestore('wemakeprice');
  const { data: tiketData, loading: tiketLoading } = useFirestore('tiket');

  if (coupangLoading || naverLoading || gmarketLoading || wemakepriceLoading || tiketLoading) {
    return <CircularProgress />;
  }

  const readExcel = (file, name) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e) => {
      const bufferArray = e.target.result;
      const wb = XLSX.read(bufferArray, { type: 'buffer' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      setItemList((prev) => ({ ...prev, [name]: data }));

      let marketTotalCount = 0;
      data.forEach((item) => {
        const mapping = getMappings(name)[item.옵션ID || item.옵션정보 || item.상품번호 || item.옵션 || item.옵션번호];
        if (mapping) {
          const quantity = parseInt(item['구매수(수량)'] || item.수량 || item.구매수량, 10) * (mapping.count || 1);
          marketTotalCount += quantity;
          filese.push(new Delivery(item.수취인이름 || item.수취인명 || item.수령인명, item.구매자전화번호 || item.수취인연락처1 || item['수령인 휴대폰'], item['수취인 주소'] || item.통합배송지 || item.주소, quantity, mapping.boxSize, item.배송메세지 || item.배송요청메모 || item['배송시 요구사항'], mapping.description, (mapping.price || 0) * quantity));
        } else {
          alert(`옵션ID ${item.옵션ID}에 대한 데이터가 없습니다. 관리자에게 문의하세요.`);
        }
      });

      useStore.setState((state) => ({ marketTotalCount: state.marketTotalCount + marketTotalCount }));
    };
  };

  const getMappings = (name) => {
    switch (name) {
      case 'coupang':
        return coupangData;
      case 'naver':
        return naverData;
      case 'gmarket':
        return gmarketData;
      case 'wemakeprice':
        return wemakepriceData;
      case 'tiket':
        return tiketData;
      default:
        return {};
    }
  };

  function Delivery(username, phone, address, quantity, boxSize, message, name, price) {
    this.예약구분 = '';
    this.집하예정일 = '';
    this.받는분성명 = username;
    this.받는분전화번호 = phone;
    this.받는분기타연락처 = '';
    this.받는분우편번호 = '';
    this.받는분주소 = address;
    this.운송장번호 = '';
    this.고객주문번호 = '';
    this.품목명 = name;
    this.박스수량 = quantity;
    this.박스타입 = boxSize;
    this.기본운임 = price;
    this.배송메세지1 = message;
    this.배송메세지2 = '';
  }

  const onClickOperMarket = () => {
    const sumQuantities = (marketItemList, productMappings) => {
      return Object.keys(productMappings).reduce((acc, productId) => {
        const mapping = productMappings[productId];
        const filteredItems = marketItemList.filter(item => String(item.옵션ID) === productId || String(item.옵션정보) === productId || String(item.상품번호) === productId || String(item.옵션) === productId || String(item.옵션번호) === productId);
        const sum = filteredItems.reduce((total, item) => total + Number(item['구매수(수량)'] || item.수량 || item.구매수량), 0);
        if (sum > 0) {
          acc[productId] = {
            size: mapping.size,
            description: mapping.description,
            count: sum,
            price: mapping.price || 0,
            totalPrice: sum * (mapping.price || 0)
          };
        }
        return acc;
      }, {});
    };

    const totalSums = ['coupang', 'naver', 'gmarket', 'wemakeprice', 'tiket'].reduce((acc, market) => {
      const marketSums = sumQuantities(itemList[market], getMappings(market));
      Object.keys(marketSums).forEach(productId => {
        if (!acc[productId]) {
          acc[productId] = { ...marketSums[productId] };
        } else {
          acc[productId].count += marketSums[productId].count;
          acc[productId].totalPrice += marketSums[productId].totalPrice;
        }
      });
      return acc;
    }, {});

    useStore.setState((state) => ({
      productCounts: { ...state.productCounts, ...Object.fromEntries(Object.entries(totalSums).filter(([_, value]) => value.count > 0)) },
      productPrices: totalSums
    }));

    console.log("토탈", totalSums);
    console.log("Count", count);
  };

  const onChangeFile = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    readExcel(file, name);
  };

  const handleRegister = async () => {
    try {
      await addDoc(collection(db, 'opnemarket'), {
        products: productPrices,
        createdAt: new Date()
      });
      alert('Products registered successfully!');
    } catch (error) {
      console.error('Error registering products: ', error);
      alert('Error registering products. Please try again.');
    }
  };

  let today = new Date();
  let time = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    date: today.getDate(),
    hours: today.getHours(),
    minutes: today.getMinutes(),
  };

  const originalExcelDownload = () => {
    var wb = XLSX.utils.book_new(),
      ws = XLSX.utils.json_to_sheet(filese);

    XLSX.utils.book_append_sheet(wb, ws, 'sheet1');

    XLSX.writeFile(wb, `수취인형식(통합형)${time.year}${time.month}${time.date}${time.hours}.xlsx`);
  };

  return (
    <Page title="에스엔피 파이어베이스 연동 오픈마켓">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          에스엔피 파이어베이스 연동 오픈마켓
          <Button
            onClick={onClickOperMarket}
            variant="contained"
            color="secondary"
            endIcon={<Iconify icon="ic:round-access-alarm" />}
          >
            자료집계
          </Button>
        </Typography>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="오픈마켓 판매현황판" />
            <CollapsibleTable
              data={Object.values(productPrices).map((product) => ({
                상품명: product.description,
                수량: product.count,
                단가: product.price,
                합계: product.totalPrice
              }))}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleRegister}
              sx={{ mt: 2 }}
            >
              등록
            </Button>
          </Card>
        </Grid>
      </Container>
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          에스엔피 오픈마켓 자료 택배자료 변환
        </Typography>
        <Typography gutterBottom>
          <button onClick={ajax요청}>버튼</button>
          카드 : {count}
        </Typography>
        <br />
        <Typography>
          쿠팡 파일 선택!!
          <input id="coupang" name="coupang" type="file" onChange={onChangeFile} />
          수량 : {itemList.coupang.length}개
        </Typography>
        <br />
        <Typography>
          네이버 파일 선택!!
          <input id="naver" name="naver" type="file" onChange={onChangeFile} />
          수량 : {itemList.naver.length}개
        </Typography>
        <br />
        <Typography>
          옥션지마켓 파일 선택!!
          <input id="gmarket" name="gmarket" type="file" onChange={onChangeFile} />
          수량 : {itemList.gmarket.length}개
        </Typography>
        <br />
        <Typography>
          위메프 파일 선택!!
          <input id="wemakeprice" name="wemakeprice" type="file" onChange={onChangeFile} />
          수량 : {itemList.wemakeprice.length}개
        </Typography>
        <br />
        <Typography>
          티켓몬스터 파일 선택!!
          <input id="tiket" name="tiket" type="file" onChange={onChangeFile} />
          수량 : {itemList.tiket.length}개
        </Typography>
        <br />
        <Typography>
          여기서부터 아직못함!!
          <br />
          11번가 파일 선택!!
          <input id="st" name="st" type="file" onChange={onChangeFile} />
          수량 : {itemList.st.length}개
        </Typography>
        <br />
        <Typography>
          인터파크 파일 선택!!
          <input id="interpark" name="interpark" type="file" onChange={onChangeFile} />
          수량 : {itemList.interpark.length}개
        </Typography>
        <br />
        <Typography>
          롯데온 파일 선택!!
          <input id="lotte" name="lotte" type="file" onChange={onChangeFile} />
          수량 : {itemList.lotte.length}개
        </Typography>
        <br />
        <Typography>
          <button onClick={originalExcelDownload}> 택배자료 다운로드 </button>
        </Typography>
      </Container>
    </Page>
  );
};

PageOne.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default PageOne;

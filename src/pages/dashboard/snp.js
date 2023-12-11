import { Container, Typography, Grid, Card, CardHeader, Button, Stack, CircularProgress } from '@mui/material';
// layouts
import Layout from '../../layouts';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
//zustand
import create from 'zustand';
import { reject, set } from 'lodash';
import { useCallback, useState } from 'react';
import readXlsxFile from 'read-excel-file';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import CollapsibleTable from '../../components/table';
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

PageOne.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// ----------------------------------------------------------------------

const useStore = create(() => ({
  count: 0,
  twentyL: 0,
  twentyM: 0,
  twentyS: 0,
  tenL: 0,
  tenM: 0,
  tenS: 0,
  tenSS: 0,
  fiveL: 0,
  fiveM: 0,
  fiveS: 0,
  fiveSS: 0,
  threeL: 0,
  threeM: 0,
  threeS: 0,
  // 여기부터추가 1227
  fiveSSS: 0,
  tenSSS: 0,
  carrotTen: 0,
  potatoFiveXXL: 0,
  potatoFiveXL: 0,
  potatoFiveL: 0,
  potatoFiveM: 0,
  garlicOneL: 0,
  garlicOneM: 0,
  garlicOneS: 0,
  garlicTenL: 0,
  garlicTenM: 0,
  garlicTenS: 0,
  garlicTwentyL: 0,
  garlicTwentyM: 0,
  garlicTwentyS: 0,
  //깐양파 추가
  onionTenL: 0,
  onionTenM: 0,
  onionTenS: 0,


  증가() {
    set((state) => ({ count: state.count + 1 }));
  },

  async ajax요청() {
    const response = await fetch('https://codingapple1.github.io/data.json');
    console.log(await response.json());
  },
}));
const filese = [];
const user = [];

export default function PageOne() {
  const { themeStretch } = useSettings();
  const {
    count,
    증가,
    ajax요청,
    twentyL,
    twentyM,
    twentyS,
    tenL,
    tenM,
    tenS,
    tenSS,
    //five 는 snp에는 없어서 15키로로 설정하였음
    fiveL,  //15kg
    fiveM,  //15kg
    fiveS,  //15kg
    fiveSS, //15kg
    threeL,
    threeM,
    threeS,
    fiveSSS,
    tenSSS,
    carrotTen,
    potatoFiveXXL,
    potatoFiveXL,
    potatoFiveL,
    potatoFiveM,
    garlicOneL,
    garlicOneM,
    garlicOneS,
    garlicTenL,
    garlicTenM,
    garlicTenS,
    garlicTwentyL,
    garlicTwentyM,
    garlicTwentyS,
    onionTenL,
    onionTenM,
    onionTenS,

    //

  } = useStore();

  //파일명 !
  const [isLoading, setIsLoading] = useState(true);

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




  //쿠팡
  const coupangProductMappings = {
    // '75962046427': { name: 'coupangThreeL', description: 'SNP**합천 햇양파(특) 3kg', boxSize: '소', size: "threeL" },
    '81304130911': { name: 'coupangFiveL', description: 'SNP**합천 햇양파(특) 15kg', boxSize: '중', size: "fiveL" },
    '80931650520': { name: 'coupangTenL', description: 'SNP**합천 햇양파(특) 10kg', boxSize: '소', size: "tenL" },
    // '75962239350': { name: 'coupangThreeM', description: 'SNP**합천 햇양파(대) 3kg', boxSize: '소', size: "threeM" },
    '81304130939': { name: 'coupangFiveM', description: 'SNP**합천 햇양파(대) 15kg', boxSize: '중', size: "fiveM" },
    '80931650516': { name: 'coupangTenM', description: 'SNP**합천 햇양파(대) 10kg', boxSize: '소', size: "tenM" },
    // '75938820691': { name: 'coupangThreeS', description: 'SNP**합천 햇양파(중) 3kg', boxSize: '소', size: "threeS" },
    '81304130926': { name: 'coupangFiveS', description: 'SNP**합천 햇양파(중) 15kg', boxSize: '중', size: "fiveS" },
    '80931650513': { name: 'coupangTenS', description: 'SNP**합천 햇양파(중) 10kg', boxSize: '소', size: "tenS" },
    '78670305294': { name: 'coupangTwentyL', description: 'SNP**합천 햇양파(특) 20kg', boxSize: '중', size: "twentyL" },
    '78670343332': { name: 'coupangTwentyM', description: 'SNP**합천 햇양파(대) 20kg', boxSize: '중', size: "twentyM" },
    '78670337609': { name: 'coupangTwentyS', description: 'SNP**합천 햇양파(중) 20kg', boxSize: '중', size: "twentyS" },
    '82363639849': { name: 'coupangFiveSS', description: 'SNP**합천 햇양파(소) 15kg', boxSize: '중', size: "fiveSS" },
    '82363628991': { name: 'coupangTenSS', description: 'SNP**합천 햇양파(소) 10kg', boxSize: '소', size: "tenSS" },
    '81485816692': { name: 'coupangFiveSSS', description: 'SNP**합천 햇양파(장아찌) 15kg', boxSize: '중', size: "fiveSSS" },
    '81485816707': { name: 'coupangTenSSS', description: 'SNP**합천 햇양파(장아찌) 10kg', boxSize: '소', size: "tenSSS" },
    '85226954862': { name: 'coupangCarrotTen', description: '베트남당근(중) 10kg', boxSize: '소', size: "carrotTen" },

    //마늘추가
    '87820378478': { name: 'coupangCarrotTen', description: '2023년산-깐마늘1kg(대) 1개', boxSize: '소', size: "garlicOneL" },
    '87820378461': { name: 'coupangCarrotTen', description: '2023년산-깐마늘1kg(중) 1개', boxSize: '소', size: "garlicOneM" },
    '87820378446': { name: 'coupangCarrotTen', description: '2023년산-깐마늘1kg(소) 1개', boxSize: '소', size: "garlicOneS" },
    //10kg
    '87820378456': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(대) 1개', boxSize: '소', size: "garlicTenL" },
    '87820378451': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(중) 1개', boxSize: '소', size: "garlicTenM" },
    '87820378492': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(소) 1개', boxSize: '소', size: "garlicTenS" },
    //20kg
    '87820378438': { name: 'coupangCarrotTen', description: '2023년산-깐마늘20kg(대) 1개', boxSize: '중', size: "garlicTwentyL" },
    '87820378466': { name: 'coupangCarrotTen', description: '2023년산-깐마늘20kg(중) 1개', boxSize: '중', size: "garlicTwentyM" },
    '87820378485': { name: 'coupangCarrotTen', description: '2023년산-깐마늘20kg(소) 1개', boxSize: '중', size: "garlicTwentyS" },

    //감자 5kg
    '87820752732': { name: 'coupangPotatoFiveXXL', description: '감자(왕특) 5kg', boxSize: '소', size: "potatoFiveXXL" },
    '87820752728': { name: 'coupangPotatoFiveXL', description: '감자(특) 5kg', boxSize: '소', size: "potatoFiveXL" },
    '87820752723': { name: 'coupangPotatoFiveL', description: '감자(상) 5kg', boxSize: '소', size: "potatoFiveL" },
    // '87899558180': { name: 'coupangPotatoFiveM', description: '감자(중) 5kg', boxSize: '소', size: "potatoFiveM" },

    //깐양파 10kg
    '87960809196': { name: 'coupangPotatoFiveXXL', description: '2023년산-10kg 깐양파(대) 1box', boxSize: '소', size: "onionTenL" },
    '87960809193': { name: 'coupangPotatoFiveXL', description: '2023년산-10kg 깐양파(중) 1box', boxSize: '소', size: "onionTenM" },
    '87960809201': { name: 'coupangPotatoFiveL', description: '2023년산-10kg 깐양파(소) 1box', boxSize: '소', size: "onionTenS" },


    // 추가적인 제품 옵션들을 여기에 계속 추가할 수 있습니다.
  };


  const naverProductMappings = {
    // '크기: 양파(특) / 중량: 3kg': { name: 'naverThreeL', description: 'SNP**양파(특) / 중량: 3kg', boxSize: '소', size: "threeL" },
    // '크기: 양파(대) / 중량: 3kg': { name: 'naverThreeM', description: 'SNP**양파(대) / 중량: 3kg', boxSize: '소', size: "threeM" },
    // '크기: 양파(중) / 중량: 3kg': { name: 'naverThreeS', description: 'SNP**양파(중) / 중량: 3kg', boxSize: '소', size: "threeS" },
    // '크기: 양파(특) / 중량: 5kg': { name: 'naverFiveL', description: '양파(특) / 중량: 5kg', boxSize: '소', size: "fiveL" },
    // '크기: 양파(대) / 중량: 5kg': { name: 'naverFiveM', description: '양파(대) / 중량: 5kg', boxSize: '소', size: "fiveM" },
    // '크기: 양파(중) / 중량: 5kg': { name: 'naverFiveS', description: '양파(중) / 중량: 5kg', boxSize: '소', size: "fiveS" },
    // '크기: 양파(특) / 중량: 10kg': { name: 'naverTenL', description: '양파(특) / 중량: 10kg', boxSize: '소', size: "tenL" },
    // '크기: 양파(대) / 중량: 10kg': { name: 'naverTenM', description: '양파(대) / 중량: 10kg', boxSize: '소', size: "tenM" },
    // '크기: 양파(중) / 중량: 10kg': { name: 'naverTenS', description: '양파(중) / 중량: 10kg', boxSize: '소', size: "tenS" },


    // 양파 
    '양파 사이즈: 15kg 특': { name: 'naverFiveL', description: 'SNP**양파(특) / 중량: 15kg', boxSize: '중', size: "fiveL" },
    '양파 사이즈: 15kg 대': { name: 'naverFiveM', description: 'SNP**양파(대) / 중량: 15kg', boxSize: '중', size: "fiveM" },
    '양파 사이즈: 15kg 중': { name: 'naverFiveS', description: 'SNP**양파(중) / 중량: 15kg', boxSize: '중', size: "fiveS" },
    '양파 사이즈: 10kg 특': { name: 'naverTenL', description: 'SNP**양파(특) / 중량: 10kg', boxSize: '소', size: "tenL" },
    '양파 사이즈: 10kg 대': { name: 'naverTenM', description: 'SNP**양파(대) / 중량: 10kg', boxSize: '소', size: "tenM" },
    '양파 사이즈: 10kg 중': { name: 'naverTenS', description: 'SNP**양파(중) / 중량: 10kg', boxSize: '소', size: "tenS" },
    //짱아치 추가 
    // '양파 사이즈: 10kg 짱아찌': { name: 'naverTenS', description: '양파(중) / 중량: 10kg', boxSize: '소', size: "fiveSSS" },
    '양파 사이즈: 10kg 짱아찌': { name: 'naverTenS', description: '양파(중) / 중량: 10kg', boxSize: '소', size: "tenSSS" },


    //깐양파  
    '깐양파-사이즈: 10kg 대': { name: 'naverTenL', description: 'SNP**깐양파(대) / 중량: 10kg', boxSize: '소', size: "onionTenL" },
    '깐양파-사이즈: 10kg 중': { name: 'naverTenM', description: 'SNP**깐양파(중) / 중량: 10kg', boxSize: '소', size: "onionTenM" },
    '깐양파-사이즈: 10kg 소': { name: 'naverTenS', description: 'SNP**깐양파(소) / 중량: 10kg', boxSize: '소', size: "onionTenS" },

    //깐마늘 1kg
    '깐마늘-사이즈: 1kg 대': { name: 'naverTenL', description: 'SNP**깐마늘(대) / 중량: 1kg', boxSize: '소', size: "garlicOneL" },
    '깐마늘-사이즈: 1kg 중': { name: 'naverTenM', description: 'SNP**깐마늘(중) / 중량: 1kg', boxSize: '소', size: "garlicOneM" },
    '깐마늘-사이즈: 1kg 소': { name: 'naverTenS', description: 'SNP**깐마늘(소) / 중량: 1kg', boxSize: '소', size: "garlicOneS" },

    //깐마늘 10kg
    '깐마늘-사이즈: 10kg 대': { name: 'naverTenL', description: 'SNP**깐마늘(대) / 중량: 10kg', boxSize: '소', size: "garlicTenL" },
    '깐마늘-사이즈: 10kg 중': { name: 'naverTenM', description: 'SNP**깐마늘(중) / 중량: 10kg', boxSize: '소', size: "garlicTenM" },
    '깐마늘-사이즈: 10kg 소': { name: 'naverTenS', description: 'SNP**깐마늘(소) / 중량: 10kg', boxSize: '소', size: "garlicTenS" },


    //깐마늘 20kg
    '깐마늘-사이즈: 20kg 대': { name: 'naverTenL', description: 'SNP**깐마늘(대) / 중량: 10kg', boxSize: '소', size: "garlicTwentyL" },
    '깐마늘-사이즈: 20kg 중': { name: 'naverTenM', description: 'SNP**깐마늘(중) / 중량: 10kg', boxSize: '소', size: "garlicTwentyM" },
    '깐마늘-사이즈: 20kg 소': { name: 'naverTenS', description: 'SNP**깐마늘(소) / 중량: 10kg', boxSize: '소', size: "garlicTwentyS" },




    // 추가적인 옵션 정보들을 여기에 계속 추가할 수 있습니다.
  };


  const gmarketProductMappings = {
    'C392317388': { name: 'gmarketThreeL', description: '합천 햇양파(특) 3kg', boxSize: '소', size: "threeL" },
    '2183841490': { name: 'gmarketThreeL', description: '합천 햇양파(특) 3kg', boxSize: '소', size: "threeL" },
    'C392297622': { name: 'gmarketThreeM', description: '합천 햇양파(대) 3kg', boxSize: '소', size: "threeM" },
    '2183843227': { name: 'gmarketThreeM', description: '합천 햇양파(대) 3kg', boxSize: '소', size: "threeM" },
    'C392319035': { name: 'gmarketThreeS', description: '합천 햇양파(중) 3kg', boxSize: '소', size: "threeS" },
    '2183840549': { name: 'gmarketThreeS', description: '합천 햇양파(중) 3kg', boxSize: '소', size: "threeS" },
    'D239484736': { name: 'gmarketFiveL', description: '합천 햇양파(특) 5kg', boxSize: '소', size: "fiveL" },
    '2428131566': { name: 'gmarketFiveL', description: '합천 햇양파(특) 5kg', boxSize: '소', size: "fiveL" },
    'D239482491': { name: 'gmarketFiveM', description: '합천 햇양파(대) 5kg', boxSize: '소', size: "fiveM" },
    '2428134577': { name: 'gmarketFiveM', description: '합천 햇양파(대) 5kg', boxSize: '소', size: "fiveM" },
    'D239480102': { name: 'gmarketFiveS', description: '합천 햇양파(중) 5kg', boxSize: '소', size: "fiveS" },
    '2428160094': { name: 'gmarketFiveS', description: '합천 햇양파(중) 5kg', boxSize: '소', size: "fiveS" },
    'D239476742': { name: 'gmarketTenL', description: '합천 햇양파(특) 10kg', boxSize: '소', size: "tenL" },
    '2428163152': { name: 'gmarketTenL', description: '합천 햇양파(특) 10kg', boxSize: '소', size: "tenL" },
    'D239474084': { name: 'gmarketTenM', description: '합천 햇양파(대) 10kg', boxSize: '소', size: "tenM" },
    '2428164803': { name: 'gmarketTenM', description: '합천 햇양파(대) 10kg', boxSize: '소', size: "tenM" },
    'D239469150': { name: 'gmarketTenS', description: '합천 햇양파(중) 10kg', boxSize: '소', size: "tenS" },
    '2428166583': { name: 'gmarketTenS', description: '합천 햇양파(중) 10kg', boxSize: '소', size: "tenS" },
    'C497410406': { name: 'gmarketTwentyL', description: '합천 햇양파(특) 20kg', boxSize: '중', size: "twentyL" },
    '2326679260': { name: 'gmarketTwentyL', description: '합천 햇양파(특) 20kg', boxSize: '중', size: "twentyL" },
    'C497411822': { name: 'gmarketTwentyM', description: '합천 햇양파(대) 20kg', boxSize: '중', size: "twentyM" },
    '2326680206': { name: 'gmarketTwentyM', description: '합천 햇양파(대) 20kg', boxSize: '중', size: "twentyM" },
    'C497412243': { name: 'gmarketTwentyS', description: '합천 햇양파(중) 20kg', boxSize: '중', size: "twentyS" },
    '2326680444': { name: 'gmarketTwentyS', description: '합천 햇양파(중) 20kg', boxSize: '중', size: "twentyS" },
    'C449983297': { name: 'gmarketFiveSS', description: '합천 햇양파(장아찌) 5kg', boxSize: '소', size: "fiveSS" },
    '2266312184': { name: 'gmarketFiveSS', description: '합천 햇양파(장아찌) 5kg', boxSize: '소', size: "fiveSS" },
    'D595722109': { name: 'gmarketTenSS', description: '합천 햇양파(장아찌) 10kg', boxSize: '소', size: "tenSS" },
    '3178332687': { name: 'gmarketTenSS', description: '합천 햇양파(장아찌) 10kg', boxSize: '소', size: "tenSS" },
    // 추가적인 상품 번호들을 여기에 계속 추가할 수 있습니다.
  };




  const wemakepriceProductMappings = {
    '햇 양파(특) | 3kg': { description: '햇 양파(특) | 3kg', boxSize: '소', name: 'wemakepriceThreeL', size: "threeL" },
    '햇 양파(대) | 3kg': { description: '햇 양파(대) | 3kg', boxSize: '소', name: 'wemakepriceThreeM', size: "threeM" },
    '햇 양파(중) | 3kg': { description: '햇 양파(중) | 3kg', boxSize: '소', name: 'wemakepriceThreeS', size: "threeS" },
    '햇 양파(특) | 5kg': { description: '햇 양파(특) | 5kg', boxSize: '소', name: 'wemakepriceFiveL', size: "fiveL" },
    '햇 양파(대) | 5kg': { description: '햇 양파(대) | 5kg', boxSize: '소', name: 'wemakepriceFiveM', size: "fiveM" },
    '햇 양파(중) | 5kg': { description: '햇 양파(중) | 5kg', boxSize: '소', name: 'wemakepriceFiveS', size: "fiveS" },
    '햇 양파(특) | 10kg': { description: '햇 양파(특) | 10kg', boxSize: '소', name: 'wemakepriceTenL', size: "tenL" },
    '햇 양파(대) | 10kg': { description: '햇 양파(대) | 10kg', boxSize: '소', name: 'wemakepriceTenM', size: "tenM" },
    '햇 양파(중) | 10kg': { description: '햇 양파(중) | 10kg', boxSize: '소', name: 'wemakepriceTenS', size: "tenS" },
    '햇 양파(특) | 20kg': { description: '햇 양파(특) | 20kg', boxSize: '중', name: 'wemakepriceTwentyL', size: "twentyL" },
    '햇 양파(대) | 20kg': { description: '햇 양파(대) | 20kg', boxSize: '중', name: 'wemakepriceTwentyM', size: "twentyM" },
    '햇 양파(중) | 20kg': { description: '햇 양파(중) | 20kg', boxSize: '중', name: 'wemakepriceTwentyS', size: "twentyS" },
    // 추가적인 옵션들을 여기에 계속 추가할 수 있습니다.
  };



  const tiketProductMappings = {
    '8604403334': { name: 'tiketThreeL', description: '햇 양파(특) | 3kg', boxSize: '소', size: "threeL" },
    '8604432946': { name: 'tiketThreeM', description: '햇 양파(대) | 3kg', boxSize: '소', size: "threeM" },
    '8604048910': { name: 'tiketThreeS', description: '햇 양파(중) | 3kg', boxSize: '소', size: "threeS" },
    '8604403338': { name: 'tiketFiveL', description: '햇 양파(특) | 5kg', boxSize: '소', size: "fiveL" },
    '8604432950': { name: 'tiketFiveM', description: '햇 양파(대) | 5kg', boxSize: '소', size: "fiveM" },
    '8604048914': { name: 'tiketFiveS', description: '햇 양파(중) | 5kg', boxSize: '소', size: "fiveS" },
    '8604403322': { name: 'tiketTenL', description: '햇 양파(특) | 10kg', boxSize: '소', size: "tenL" },
    '8604432938': { name: 'tiketTenM', description: '햇 양파(대) | 10kg', boxSize: '소', size: "tenM" },
    '8604048918': { name: 'tiketTenS', description: '햇 양파(중) | 10kg', boxSize: '소', size: "tenS" },
    '8604403330': { name: 'tiketTwentyL', description: '햇 양파(특) | 20kg', boxSize: '중', size: "twentyL" },
    '8604432942': { name: 'tiketTwentyM', description: '햇 양파(대) | 20kg', boxSize: '중', size: "twentyM" },
    '8604048922': { name: 'tiketTwentyS', description: '햇 양파(중) | 20kg', boxSize: '중', size: "twentyS" },
    // 추가적인 옵션 번호들을 여기에 계속 추가할 수 있습니다.
  };


  //파일수정 !
  const readExcel = (file, name) => {
    console.log(file);
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: 'buffer' });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
    promise.then((d) => {
      console.log('어레이자료!!');
      console.log(d);
      switch (name) {
        case 'coupang':
          console.log('쿠팡접속완료 ! ');
          setItemList({
            ...itemList,
            coupang: d,
          });
          d.forEach(item => {
            const mapping = coupangProductMappings[item.옵션ID];
            if (mapping) {
              filese.push(new Delivery(
                item.수취인이름,
                item.구매자전화번호,
                item['수취인 주소'],
                item['구매수(수량)'],
                mapping.boxSize,
                item.배송메세지,
                mapping.description
              ));
            }
          });
          console.log(filese);



          break;
        case 'naver':
          console.log('naver접속완료! ! ');
          setItemList({
            ...itemList,
            naver: d,
          });
          d.forEach(item => {
            const mapping = naverProductMappings[item.옵션정보];
            if (mapping) {
              filese.push(new Delivery(
                item.수취인명,
                item.수취인연락처1,
                item.통합배송지,
                item.수량,
                mapping.boxSize,
                item.배송메세지,
                mapping.description
              ));
            }
          });

          break;
        case 'gmarket':
          console.log('gmarket접속완료! ! ');
          setItemList({
            ...itemList,
            gmarket: d,
          });
          d.forEach(item => {
            const mapping = gmarketProductMappings[item.상품번호];
            if (mapping) {
              filese.push(new Delivery(
                item.수령인명,
                item['수령인 휴대폰'],
                item.주소,
                item.수량,
                mapping.boxSize,
                item['배송시 요구사항'],
                mapping.description
              ));
            }
          });
          break;
        case 'wemakeprice':
          console.log('wemakeprice접속완료! ! ');
          setItemList({
            ...itemList,
            wemakeprice: d,
          });
          d.forEach(item => {
            const mapping = wemakepriceProductMappings[item.옵션];
            if (mapping) {
              filese.push(new Delivery(
                item.받는사람,
                item['받는사람 연락처'],
                item.주소,
                item.수량,
                mapping.boxSize,
                item.배송메세지,
                mapping.description
              ));
            }
          });
          break;
        case 'tiket':
          console.log('tiket접속완료! ! ');
          setItemList({
            ...itemList,
            tiket: d,
          });

          d.forEach(item => {
            const mapping = tiketProductMappings[item.옵션번호];
            if (mapping) {
              filese.push(new Delivery(
                item.수취인명,
                item.수취인연락처,
                item.수취인주소,
                item.구매수량,
                mapping.boxSize,
                item.배송요청메모,
                mapping.description
              ));
            }
          });
          console.log('자료!!');
          console.log(filese);

          break;
        case 'st':
          console.log('st접속완료! ! ');
          setItemList({
            ...itemList,
            st: d,
          });
          break;

        case 'interpark':
          console.log('interpark접속완료! ! ');
          setItemList({
            ...itemList,
            interpark: d,
          });
          break;
        case 'lotte':
          console.log('lotte접속완료! ! ');
          setItemList({
            ...itemList,
            lotte: d,
          });
          break;
      }
    });
  };



  function Delivery(username, phone, address, quantity, boxSize, message, name) {
    this.예약구분 = '';
    this.집하예정일 = '';
    this.받는분성명 = username;
    this.받는분전화번호 = phone;
    this.받는분기타연락처 = '';
    this.받는분우편번호 = '';
    this.받는분주소 = address;
    this.운송장번호 = '';
    this.고객주문번호 = '';
    this.품목명 = '식품(농산물)';
    this.박스수량 = quantity;
    this.박스타입 = boxSize;
    this.기본운임 = '';
    this.배송메세지1 = message;
    this.배송메세지2 = '';
    this.품목명 = name;
  }

  const onClickOperMarket = () => {
    const sumQuantities = (marketItemList, productMappings) => {
      return Object.keys(productMappings).reduce((acc, productId) => {
        const mapping = productMappings[productId];
        const filteredItems = marketItemList.filter(item =>
          String(item.옵션ID) === productId ||
          String(item.옵션정보) === productId ||
          String(item.상품번호) === productId ||
          String(item.옵션) === productId ||
          String(item.옵션번호) === productId

        );
        const sum = filteredItems.reduce((total, item) =>
          total + Number(item['구매수(수량)'] || Number(item.수량) || Number(item.구매수량)), 0
        );
        acc[mapping.size] = (acc[mapping.size] || 0) + sum;
        return acc;
      }, {});
    };

    const coupangSums = sumQuantities(itemList.coupang, coupangProductMappings);
    const naverSums = sumQuantities(itemList.naver, naverProductMappings);
    const gmarketSums = sumQuantities(itemList.gmarket, gmarketProductMappings);
    const wemakepriceSums = sumQuantities(itemList.wemakeprice, wemakepriceProductMappings);
    const tiketSums = sumQuantities(itemList.tiket, tiketProductMappings);

    // 모든 마켓플레이스의 합계를 결합
    const totalSums = {};
    ['threeL', 'fiveL', 'tenL', 'twentyL', 'threeM', 'fiveM', 'tenM', 'twentyM', 'threeS', 'fiveS', 'tenS', 'twentyS', 'fiveSS', 'tenSS', 'fiveSSS', 'tenSSS', 'carrotTen', 'potatoFiveXXL', 'potatoFiveXL', 'potatoFiveL', 'potatoFiveM', 'garlicOneL',
      'garlicOneM',
      'garlicOneS',
      'garlicTenL',
      'garlicTenM',
      'garlicTenS',
      'garlicTwentyL',
      'garlicTwentyM',
      'garlicTwentyS',
      'onionTenL',
      'onionTenM',
      'onionTenS'].forEach(size => {
        totalSums[size] = (coupangSums[size] || 0) + (naverSums[size] || 0) + (gmarketSums[size] || 0) + (wemakepriceSums[size] || 0) + (tiketSums[size] || 0);
      });

    // useStore의 각 상태 업데이트
    useStore.setState(totalSums);

    // 디버깅을 위한 로그
    console.log("토탈");
    console.log(totalSums);
  };

  //수정코드
  const onChangeFile = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    readExcel(file, name);
  };

  let today = new Date(); // today 객체에 Date()의 결과를 넣어줬다
  let time = {
    year: today.getFullYear(), //현재 년도
    month: today.getMonth() + 1, // 현재 월
    date: today.getDate(), // 현재 날짜
    hours: today.getHours(), //현재 시간
    minutes: today.getMinutes(), //현재 분
  };

  const originalExcelDownload = () => {
    var wb = XLSX.utils.book_new(),
      ws = XLSX.utils.json_to_sheet(filese);

    XLSX.utils.book_append_sheet(wb, ws, 'sheet1');

    XLSX.writeFile(wb, `수취인형식(통합형)${time.year}${time.month}${time.date}${time.hours}.xlsx`);
  };

  // 새로고침 버튼 추가 !!



  return (
    <Page title="에스엔피 오픈마켓">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          에스엔피 오픈마켓 총 합계
          <Button
            // disabled={snpBt}
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
              data={[
                //20kg
                twentyL,
                twentyM,
                twentyS,
                //15kg 3~7
                fiveL,
                fiveM,
                fiveS,
                fiveSS,
                fiveSSS,
                //10kg 8~12
                tenL,
                tenM,
                tenS,
                tenSS,
                tenSSS,
                // 마늘 1kg 13~15
                garlicOneL,
                garlicOneM,
                garlicOneS,
                // 마늘 10kg 16~18
                garlicTenL,
                garlicTenM,
                garlicTenS,
                // 마늘 20kg 19~21
                garlicTwentyL,
                garlicTwentyM,
                garlicTwentyS,
                // 감자 5kg 22~25
                potatoFiveXXL,
                potatoFiveXL,
                potatoFiveL,
                potatoFiveM,
                // 당근 26
                carrotTen,

                //깐양파 추가 27~29
                onionTenL,
                onionTenM,
                onionTenS,


                // threeL,
                // threeM,
                // threeS,

              ]}
            />
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
          <br />
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
}

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
const useStore = create((set) => ({
  count: 0,
  marketTotalCount: 0,
  marketSumTotalCount: 0,
  productCounts: {
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
    onionTenL: 0,
    onionTenM: 0,
    onionTenS: 0,
    realfiveL: 0,
    realfiveM: 0,
    realfiveS: 0,
    realfiveSS: 0,
    realfiveSSS: 0,
    carrotThree: 0,
    carrotFive: 0,
    sweetPotatoXL: 0,
    sweetPotatoL: 0,
    sweetPotatoM: 0,
    sweetPotatoS: 0,
    radishTwenty: 0,
    kollabiFive: 0,
    kollabiTen: 0,
    kollabiFifteen: 0,
    cabbageThree: 0,
    cabbageNine: 0,
    redOnionThreeL: 0,
    redOnionThreeM: 0,
    redOnionThreeS: 0,
    peeledRedOnionThreeL: 0,
    peeledRedOnionThreeM: 0,
    peeledRedOnionThreeS: 0,
    onionFixturesFive: 0,
    onionFixturesTen: 0,
    onionFixturesFifteen: 0,
    potatoFixturesFive: 0,
    potatoFixturesTen: 0,
    garlicFiveL: 0,
    garlicFiveM: 0,
    garlicFiveS: 0,
    realOnionThreeSSS: 0,
    realGarlicFiveL: 0,
    realGarlicFiveM: 0,
    realGarlicFiveS: 0,
    realGarlicTenL: 0,
    realGarlicTenM: 0,
    realGarlicTenS: 0,
    realGarlicFiftyL: 0,
    realGarlicFiftyM: 0,
    realGarlicFiftyS: 0,
    radishFive: 0,
    radishTen: 0,
    hongSanRealGarlicFiveL: 0,
    hongSanRealGarlicFiveM: 0,
    hongSanRealGarlicFiveS: 0,
    hongSanRealGarlicTenL: 0,
    hongSanRealGarlicTenM: 0,
    hongSanRealGarlicTenS: 0,
    hongSanRealGarlicFiftyL: 0,
    hongSanRealGarlicFiftyM: 0,
    hongSanRealGarlicFiftyS: 0,
  },
  증가() {
    set((state) => ({ count: state.count + 1 }));
  },
  async ajax요청() {
    const response = await fetch('https://codingapple1.github.io/data.json');
    console.log(await response.json());
  },
}));

const filese = [];

export default function PageOne() {
  const { themeStretch } = useSettings();
  const {
    count,
    증가,
    ajax요청,
    marketTotalCount,
    productCounts,
  } = useStore(state => ({
    count: state.count,
    증가: state.증가,
    ajax요청: state.ajax요청,
    marketTotalCount: state.marketTotalCount,
    productCounts: state.productCounts,
  }));

  const [isLoading, setIsLoading] = useState(true);
  const [itemList, setItemList] = useState({
    coupang: [],
    naver: [],
    gmarket: [],
    wemakeprice: [],
    toss: [],
    tiket: [],
    st: [],
    interpark: [],
    lotte: [],
  });



  //쿠팡
  //3번추가 
  const coupangProductMappings = {
    // '75962046427': { name: 'coupangThreeL', description: 'SNP**합천 햇양파(특) 3kg', boxSize: '소', size: "threeL" , price:0},
    '81304130911': { name: 'coupangFiveL', description: 'SNP**합천 햇양파(특) 15kg', boxSize: '중', size: "fiveL", price: 3500 },
    '80931650520': { name: 'coupangTenL', description: 'SNP**합천 햇양파(특) 10kg', boxSize: '소', size: "tenL", price: 0 },
    // '75962239350': { name: 'coupangThreeM', description: 'SNP**합천 햇양파(대) 3kg', boxSize: '소', size: "threeM" , price:0 },
    '81304130939': { name: 'coupangFiveM', description: 'SNP**합천 햇양파(대) 15kg', boxSize: '중', size: "fiveM", price: 3500 },
    '80931650516': { name: 'coupangTenM', description: 'SNP**합천 햇양파(대) 10kg', boxSize: '소', size: "tenM", price: 0 },
    // '75938820691': { name: 'coupangThreeS', description: 'SNP**합천 햇양파(중) 3kg', boxSize: '소', size: "threeS" , price:0},
    '81304130926': { name: 'coupangFiveS', description: 'SNP**합천 햇양파(중) 15kg', boxSize: '중', size: "fiveS", price: 3500 },
    '80931650513': { name: 'coupangTenS', description: 'SNP**합천 햇양파(중) 10kg', boxSize: '소', size: "tenS", price: 0 },
    '78670305294': { name: 'coupangTwentyL', description: 'SNP**합천 햇양파(특) 20kg', boxSize: '대', size: "twentyL", price: 5000 },
    '78670343332': { name: 'coupangTwentyM', description: 'SNP**합천 햇양파(대) 20kg', boxSize: '대', size: "twentyM", price: 5000 },
    '78670337609': { name: 'coupangTwentyS', description: 'SNP**합천 햇양파(중) 20kg', boxSize: '대', size: "twentyS", price: 5000 },
    '82363639849': { name: 'coupangFiveSS', description: 'SNP**합천 햇양파(소) 15kg', boxSize: '중', size: "fiveSS", price: 3500 },
    '82363628991': { name: 'coupangTenSS', description: 'SNP**합천 햇양파(소) 10kg', boxSize: '소', size: "tenSS", price: 0 },
    '81485816692': { name: 'coupangFiveSSS', description: 'SNP**합천 햇양파(장아찌) 15kg', boxSize: '중', size: "fiveSSS", price: 3500 },
    '81485816707': { name: 'coupangTenSSS', description: 'SNP**합천 햇양파(장아찌) 10kg', boxSize: '소', size: "tenSSS", price: 0 },
    '85226903402': { name: 'coupangCarrotTen', description: '베트남당근(중) 10kg', boxSize: '소', size: "carrotTen", price: 0 },


    //20키로 햇양파 추가 240117
    '80818673834': { name: 'coupangTwentyL', description: 'SNP**합천 햇양파(특) 20kg', boxSize: '대', size: "twentyL", price: 5000 },
    '80818673849': { name: 'coupangTwentyM', description: 'SNP**합천 햇양파(대) 20kg', boxSize: '대', size: "twentyM", price: 5000 },
    '80818673862': { name: 'coupangTwentyS', description: 'SNP**합천 햇양파(중) 20kg', boxSize: '대', size: "twentyS", price: 5000 },
    '81304421688': { name: 'coupangTenL', description: 'SNP**합천 햇양파(특) 10kg', boxSize: '소', size: "tenL", price: 0 },
    '81304421715': { name: 'coupangTenM', description: 'SNP**합천 햇양파(대) 10kg', boxSize: '소', size: "tenM", price: 0 },
    '81304421677': { name: 'coupangTenS', description: 'SNP**합천 햇양파(중) 10kg', boxSize: '소', size: "tenS", price: 0 },
    '81304421706': { name: 'coupangFiveL', description: 'SNP**합천 햇양파(특) 15kg', boxSize: '중', size: "fiveL", price: 3500 },
    '81304421698': { name: 'coupangFiveM', description: 'SNP**합천 햇양파(대) 15kg', boxSize: '중', size: "fiveM", price: 3500 },
    '81304421725': { name: 'coupangFiveS', description: 'SNP**합천 햇양파(중) 15kg', boxSize: '중', size: "fiveS", price: 3500 },
    '81485837169': { name: 'coupangFiveSSS', description: 'SNP**합천 햇양파(장아찌) 15kg', boxSize: '중', size: "fiveSSS", price: 3500 },
    '81485837159': { name: 'coupangTenSSS', description: 'SNP**합천 햇양파(장아찌) 10kg', boxSize: '소', size: "tenSSS", price: 0 },


    //10키로 중 추가 
    '88266295589': { name: 'coupangTenS', description: 'SNP**합천 햇양파(중) 10kg', boxSize: '소', size: "tenS", price: 0 },

    //5키로 추가
    '88266271116': { name: 'coupangFiveL', description: 'SNP**합천 햇양파(왕특) 5kg', boxSize: '극소', size: "realfiveL", price: 0 },
    '88266271105': { name: 'coupangFiveM', description: 'SNP**합천 햇양파(특) 5kg', boxSize: '극소', size: "realfiveM", price: 0 },
    '88266271083': { name: 'coupangFiveS', description: 'SNP**합천 햇양파(상) 5kg', boxSize: '극소', size: "realfiveS", price: 0 },
    '88266271092': { name: 'coupangFiveSS', description: 'SNP**합천 햇양파(중) 5kg', boxSize: '극소', size: "realfiveSS", price: 0 },
    '88266271131': { name: 'coupangFiveSSS', description: 'SNP**합천 햇양파(장아찌) 5kg', boxSize: '극소', size: "realfiveSSS", price: 0 },

    //5키로 추가
    // '88266271116': { name: 'coupangFiveL', description: 'SNP**합천 햇양파(왕특) 5kg', boxSize: '소', size: "realfiveL", price: 0 },
    '88242186374': { name: 'coupangFiveM', description: 'SNP**합천 햇양파(특) 5kg', boxSize: '극소', size: "realfiveL", price: 0 },
    '88242186379': { name: 'coupangFiveS', description: 'SNP**합천 햇양파(대) 5kg', boxSize: '극소', size: "realfiveM", price: 0 },
    '88242186370': { name: 'coupangFiveSS', description: 'SNP**합천 햇양파(중) 5kg', boxSize: '극소', size: "realfiveS", price: 0 },
    '88242186382': { name: 'coupangFiveSS', description: 'SNP**합천 햇양파(소) 5kg', boxSize: '극소', size: "realfiveSS", price: 0 },
    '88242186362': { name: 'coupangFiveSSS', description: 'SNP**합천 햇양파(장아찌) 5kg', boxSize: '극소', size: "realfiveSSS", price: 0 },


    //마늘추가
    '87820378478': { name: 'coupangCarrotTen', description: '2023년산-깐마늘1kg(대) 1개', boxSize: '극소', size: "garlicOneL", price: 0 },
    '87820378461': { name: 'coupangCarrotTen', description: '2023년산-깐마늘1kg(중) 1개', boxSize: '극소', size: "garlicOneM", price: 0 },
    '87820378446': { name: 'coupangCarrotTen', description: '2023년산-깐마늘1kg(소) 1개', boxSize: '극소', size: "garlicOneS", price: 0 },
    //10kg
    '87820378456': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(대) 1개', boxSize: '소', size: "garlicTenL", price: 0 },
    '87820378451': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(중) 1개', boxSize: '소', size: "garlicTenM", price: 0 },
    '87820378492': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(소) 1개', boxSize: '소', size: "garlicTenS", price: 0 },

    //10kg 추가 240117
    '88399922358': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(대) 1개', boxSize: '소', size: "garlicTenL", price: 0 },
    '88399922365': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(중) 1개', boxSize: '소', size: "garlicTenM", price: 0 },
    '88399922378': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(소) 1개', boxSize: '소', size: "garlicTenS", price: 0 },
    //20kg 깐마늘 
    '87820378438': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(대) 1개', boxSize: '소', size: "garlicTwentyL", price: 0, count: 2 },
    '87820378466': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(중) 1개', boxSize: '소', size: "garlicTwentyM", price: 0, count: 2 },
    '87820378485': { name: 'coupangCarrotTen', description: '2023년산-깐마늘10kg(소) 1개', boxSize: '소', size: "garlicTwentyS", price: 0, count: 2 },

    //감자 5kg
    '87820752732': { name: 'coupangPotatoFiveXXL', description: '감자(왕특) 5kg', boxSize: '극소', size: "potatoFiveXXL", price: 0 },
    '87820752728': { name: 'coupangPotatoFiveXL', description: '감자(특) 5kg', boxSize: '극소', size: "potatoFiveXL", price: 0 },
    '87820752723': { name: 'coupangPotatoFiveL', description: '감자(상) 5kg', boxSize: '극소', size: "potatoFiveL", price: 0 },
    '88328895075': { name: 'coupangPotatoFiveM', description: '감자(중) 5kg', boxSize: '극소', size: "potatoFiveM", price: 0 },

    '88577824392': { name: 'coupangPotatoFiveM', description: '감자(비품) 5kg', boxSize: '극소', size: "potatoFixturesFive", price: 0 },
    '88577824402': { name: 'coupangPotatoFiveM', description: '감자(비품) 10kg', boxSize: '소', size: "potatoFixturesTen", price: 0 },


    //깐양파 10kg
    '87960809196': { name: 'coupangPotatoFiveXXL', description: '2023년산-10kg 깐양파(대) 1box', boxSize: '소', size: "onionTenL", price: 0 },
    '87960809193': { name: 'coupangPotatoFiveXL', description: '2023년산-10kg 깐양파(중) 1box', boxSize: '소', size: "onionTenM", price: 0 },
    '87960809201': { name: 'coupangPotatoFiveL', description: '2023년산-10kg 깐양파(소) 1box', boxSize: '소', size: "onionTenS", price: 0 },

    //당근 3kg - 5kg 
    '88319057566': { name: 'coupangPotatoFiveXXL', description: '당근3kg 1box', boxSize: '극소', size: "carrotThree", price: 0 },
    '88319057577': { name: 'coupangPotatoFiveXL', description: '당근5kg 1box', boxSize: '극소', size: "carrotFive", price: 0 },

    // 고구마 3kg
    '88319176252': { name: 'coupangPotatoFiveXXL', description: '고구마3kg(특-XL) 1box', boxSize: '극소', size: "sweetPotatoXL", price: 0 },
    '88319176243': { name: 'coupangPotatoFiveXXL', description: '고구마3kg(상-L) 1box', boxSize: '극소', size: "sweetPotatoL", price: 0 },
    '88319176235': { name: 'coupangPotatoFiveXXL', description: '고구마3kg(소-M) 1box', boxSize: '극소', size: "sweetPotatoM", price: 0 },
    '88319176247': { name: 'coupangPotatoFiveXXL', description: '고구마3kg(한입-S) 1box', boxSize: '극소', size: "sweetPotatoS", price: 0 },

    // 무 20kg
    '88319278103': { name: 'coupangPotatoFiveXXL', description: '무-20kg-1box', boxSize: '대', size: "radishTwenty", price: 5000 },
    '90559924510': { name: 'coupangPotatoFiveXXL', description: '무-20kg-1box', boxSize: '대', size: "radishTwenty", price: 5000 },

    //무 5kg
    '90559733280': { name: 'coupangPotatoFiveXXL', description: '무-5kg-1box', boxSize: '극소', size: "radishFive", price: 0 },
    '90559733271': { name: 'coupangPotatoFiveXXL', description: '무-10kg-1box', boxSize: '소', size: "radishTen", price: 0 },
    //콜라비 추가 
    '88333119386': { name: 'coupangPotatoFiveXXL', description: '콜라비-5kg-1box', boxSize: '소', size: "kollabiFive", price: 0 },
    '88333119398': { name: 'coupangPotatoFiveXXL', description: '콜라비-10kg-1box', boxSize: '소', size: "kollabiTen", price: 0 },
    '88333119410': { name: 'coupangPotatoFiveXXL', description: '콜라비-15kg-1box', boxSize: '중', size: "kollabiFifteen", price: 3500 },

    //양배추 추가 3kg, 9kg
    '88333189241': { name: 'coupangPotatoFiveXXL', description: '양배추-3kg-1box', boxSize: '극소', size: "cabbageThree", price: 0 },
    '88333189234': { name: 'coupangPotatoFiveXXL', description: '양배추-9kg-1box', boxSize: '소', size: "cabbageNine", price: 0 },


    //적양파 3kg 추가 
    '88509384622': { name: 'coupangPotatoFiveXXL', description: '(red)적양파-3kg-(대)', boxSize: '극소', size: "redOnionThreeL", price: 0 },
    '88509384626': { name: 'coupangPotatoFiveXXL', description: '(red)적양파-3kg-(중)', boxSize: '극소', size: "redOnionThreeM", price: 0 },
    '88509384617': { name: 'coupangPotatoFiveXXL', description: '(red)적양파-3kg-(소)', boxSize: '극소', size: "redOnionThreeS", price: 0 },


    //손질 적양파 3kg 추가 
    '88749850943': { name: 'coupangPotatoFiveXXL', description: '(red)손질-깐적양파-3kg-(대)', boxSize: '극소', size: "peeledRedOnionThreeL", price: 0 },
    '88749850933': { name: 'coupangPotatoFiveXXL', description: '(red)손질-깐적양파-3kg-(중)', boxSize: '극소', size: "peeledRedOnionThreeM", price: 0 },
    '88749850952': { name: 'coupangPotatoFiveXXL', description: '(red)손질-깐적양파-3kg-(소)', boxSize: '극소', size: "peeledRedOnionThreeS", price: 0 },

    //24년 햇양파 추가 
    '89320184698': { name: 'coupangFiveL', description: 'SNP**합천 햇양파(특) 5kg', boxSize: '극소', size: "realfiveL", price: 0 },
    '89320184841': { name: 'coupangFiveM', description: 'SNP**합천 햇양파(대) 5kg', boxSize: '극소', size: "realfiveM", price: 0 },
    '89320184596': { name: 'coupangFiveS', description: 'SNP**합천 햇양파(중) 5kg', boxSize: '극소', size: "realfiveS", price: 0 },
    '89320184880': { name: 'coupangFiveSS', description: 'SNP**합천 햇양파(소) 5kg', boxSize: '극소', size: "realfiveSS", price: 0 },
    '89320184642': { name: 'coupangFiveSSS', description: 'SNP**합천 햇양파(장아찌) 5kg', boxSize: '극소', size: "realfiveSSS", price: 0 },

    '89320184752': { name: 'coupangTenL', description: 'SNP**합천 햇양파(특) 10kg', boxSize: '소', size: "tenL", price: 0 },
    '89320184583': { name: 'coupangTenM', description: 'SNP**합천 햇양파(대) 10kg', boxSize: '소', size: "tenM", price: 0 },
    '89320184801': { name: 'coupangTenS', description: 'SNP**합천 햇양파(중) 10kg', boxSize: '소', size: "tenS", price: 0 },
    '89320184546': { name: 'coupangTenSS', description: 'SNP**합천 햇양파(소) 10kg', boxSize: '소', size: "tenSS", price: 0 },
    '89320184866': { name: 'coupangTenSSS', description: 'SNP**합천 햇양파(장아찌) 10kg', boxSize: '소', size: "tenSSS", price: 0 },

    '89320184627': { name: 'coupangFiveL', description: 'SNP**합천 햇양파(특) 15kg', boxSize: '중', size: "fiveL", price: 3500 },
    '89320184613': { name: 'coupangFiveM', description: 'SNP**합천 햇양파(대) 15kg', boxSize: '중', size: "fiveM", price: 3500 },
    '89320184726': { name: 'coupangFiveS', description: 'SNP**합천 햇양파(중) 15kg', boxSize: '중', size: "fiveS", price: 3500 },
    '89320184561': { name: 'coupangFiveSS', description: 'SNP**합천 햇양파(소) 15kg', boxSize: '중', size: "fiveSS", price: 3500 },
    '89320184853': { name: 'coupangFiveSSS', description: 'SNP**합천 햇양파(장아찌) 15kg', boxSize: '중', size: "fiveSSS", price: 3500 },

    //비품 추가 
    '89320184740': { name: 'coupangTenL', description: '양파(비품+쌍구) / 중량: 5kg', boxSize: '극소', size: "onionFixturesFive", price: 0 },
    '89320184671': { name: 'coupangTenL', description: '양파(비품+쌍구) / 중량: 10kg', boxSize: '소', size: "onionFixturesTen", price: 0 },
    '89320184685': { name: 'coupangTenL', description: '양파(비품+쌍구) / 중량: 15kg', boxSize: '중', size: "onionFixturesFifteen", price: 3500 },

    // 깐마늘 5키로 추가 !! 
    '89338723784': { name: 'garlicFiveL', description: '2023년산-깐마늘5kg(대) 1개', boxSize: '극소', size: "garlicFiveL", price: 0 },
    '89338723806': { name: 'garlicFiveM', description: '2023년산-깐마늘5kg(중) 1개', boxSize: '극소', size: "garlicFiveM", price: 0 },
    '89338723795': { name: 'garlicFiveS', description: '2023년산-깐마늘5kg(소) 1개', boxSize: '극소', size: "garlicFiveS", price: 0 },

    // 양파장아찌 추가 !! 
    '90508412078': { name: 'coupangTenSSS', description: 'SNP**합천 햇양파(장아찌) 10kg', boxSize: '소', size: "tenSSS", price: 0 },
    '90508412095': { name: 'coupangFiveSSS', description: 'SNP**합천 햇양파(장아찌) 5kg', boxSize: '극소', size: "realfiveSSS", price: 0 },
    '90508412110': { name: 'coupangFiveSSS', description: 'SNP**합천 햇양파(장아찌) 3kg', boxSize: '극소', size: "realOnionThreeSSS", price: 0 },

    // 통마늘 5,10, 반접 추가 20240716
    '90667412116': { name: 'coupangCarrotTen', description: '햇마늘5kg(대)-Garlic 1개', boxSize: '극소', size: "realGarlicFiveL", price: 0 },
    '90667412094': { name: 'coupangCarrotTen', description: '햇마늘5kg(중)-Garlic 1개', boxSize: '극소', size: "realGarlicFiveM", price: 0 },
    '90667412105': { name: 'coupangCarrotTen', description: '햇마늘5kg(소)-Garlic 1개', boxSize: '극소', size: "realGarlicFiveS", price: 0 },

    '90167396552': { name: 'coupangCarrotTen', description: '햇마늘10kg(대)-Garlic 1개', boxSize: '소', size: "realGarlicTenL", price: 0 },
    '90167396541': { name: 'coupangCarrotTen', description: '햇마늘10kg(중)-Garlic 1개', boxSize: '소', size: "realGarlicTenM", price: 0 },
    '90167396538': { name: 'coupangCarrotTen', description: '햇마늘10kg(소)-Garlic 1개', boxSize: '소', size: "realGarlicTenS", price: 0 },

    '90167396535': { name: 'coupangCarrotTen', description: '햇마늘반접(50개)(대)-Garlic 1개', boxSize: '극소', size: "realGarlicFiftyL", price: 0 },
    '90167396549': { name: 'coupangCarrotTen', description: '햇마늘반접(50개)(중)-Garlic 1개', boxSize: '극소', size: "realGarlicFiftyM", price: 0 },
    '90167396546': { name: 'coupangCarrotTen', description: '햇마늘반접(50개)(소)-Garlic 1개', boxSize: '극소', size: "realGarlicFiftyS", price: 0 },



    // 홍산마늘 5,10, 반접 추가 20240718
    '90727535585': { name: 'coupangCarrotTen', description: '홍산마늘5kg(대)-Garlic 1개', boxSize: '극소', size: "hongSanRealGarlicFiveL", price: 0 },
    '90727535591': { name: 'coupangCarrotTen', description: '홍산마늘5kg(중)-Garlic 1개', boxSize: '극소', size: "hongSanRealGarlicFiveM", price: 0 },
    '90727535558': { name: 'coupangCarrotTen', description: '홍산마늘5kg(소)-Garlic 1개', boxSize: '극소', size: "hongSanRealGarlicFiveS", price: 0 },

    '90727535578': { name: 'coupangCarrotTen', description: '홍산마늘10kg(대)-Garlic 1개', boxSize: '소', size: "hongSanRealGarlicTenL", price: 0 },
    '90727535553': { name: 'coupangCarrotTen', description: '홍산마늘10kg(중)-Garlic 1개', boxSize: '소', size: "hongSanRealGarlicTenM", price: 0 },
    '90727535570': { name: 'coupangCarrotTen', description: '홍산마늘10kg(소)-Garlic 1개', boxSize: '소', size: "hongSanRealGarlicTenS", price: 0 },

    '90727535563': { name: 'coupangCarrotTen', description: '홍산마늘반접(50개)(대)-Garlic 1개', boxSize: '극소', size: "hongSanRealGarlicFiftyL", price: 0 },
    '90727535537': { name: 'coupangCarrotTen', description: '홍산마늘반접(50개)(중)-Garlic 1개', boxSize: '극소', size: "hongSanRealGarlicFiftyM", price: 0 },
    '90727535545': { name: 'coupangCarrotTen', description: '홍산마늘반접(50개)(소)-Garlic 1개', boxSize: '극소', size: "hongSanRealGarlicFiftyS", price: 0 },
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
    '양파 사이즈: 15kg 특': { name: 'naverFiveL', description: 'SNP**양파(특) / 중량: 15kg', boxSize: '중', size: "fiveL", price: 3500 },
    '양파 사이즈: 15kg 대': { name: 'naverFiveM', description: 'SNP**양파(대) / 중량: 15kg', boxSize: '중', size: "fiveM", price: 3500 },
    '양파 사이즈: 15kg 중': { name: 'naverFiveS', description: 'SNP**양파(중) / 중량: 15kg', boxSize: '중', size: "fiveS", price: 3500 },
    '양파 사이즈: 10kg 특': { name: 'naverTenL', description: 'SNP**양파(특) / 중량: 10kg', boxSize: '소', size: "tenL", price: 0 },
    '양파 사이즈: 10kg 대': { name: 'naverTenM', description: 'SNP**양파(대) / 중량: 10kg', boxSize: '소', size: "tenM", price: 0 },
    '양파 사이즈: 10kg 중': { name: 'naverTenS', description: 'SNP**양파(중) / 중량: 10kg', boxSize: '소', size: "tenS", price: 0 },
    //짱아치 추가 
    '양파 사이즈: 15kg 장아찌': { name: 'naverTenS', description: '양파(장아찌) / 중량: 15kg', boxSize: '중', size: "fiveSSS", price: 3500 },
    '양파 사이즈: 10kg 장아찌': { name: 'naverTenS', description: '양파(장아찌) / 중량: 10kg', boxSize: '소', size: "tenSSS", price: 0 },
    '양파 사이즈: 15kg 짱아찌': { name: 'naverTenS', description: '양파(장아찌) / 중량: 15kg', boxSize: '중', size: "fiveSSS", price: 3500 },
    '양파 사이즈: 10kg 짱아찌': { name: 'naverTenS', description: '양파(장아찌) / 중량: 10kg', boxSize: '소', size: "tenSSS", price: 0 },

    //비품 추가 
    '양파 사이즈: 10kg 비품(쌍구+상처)': { name: 'naverTenS', description: '양파(비품+쌍구) / 중량: 10kg', boxSize: '소', size: "onionFixturesTen", price: 0 },

    //깐양파  
    '깐양파-사이즈: 10kg 대': { name: 'naverTenL', description: 'SNP**깐양파(대) / 중량: 10kg', boxSize: '소', size: "onionTenL", price: 0 },
    '깐양파-사이즈: 10kg 중': { name: 'naverTenM', description: 'SNP**깐양파(중) / 중량: 10kg', boxSize: '소', size: "onionTenM", price: 0 },
    '깐양파-사이즈: 10kg 소': { name: 'naverTenS', description: 'SNP**깐양파(소) / 중량: 10kg', boxSize: '소', size: "onionTenS", price: 0 },

    //깐양파  판매자 추가 
    '깐양파-사이즈: (판)10kg 대': { name: 'naverTenL', description: 'SNP$$$깐양파(대) / 중량: 10kg', boxSize: '소', size: "onionTenL", price: 0 },
    '깐양파-사이즈: (판)10kg 중': { name: 'naverTenM', description: 'SNP$$$깐양파(중) / 중량: 10kg', boxSize: '소', size: "onionTenM", price: 0 },
    '깐양파-사이즈: (판)10kg 소': { name: 'naverTenS', description: 'SNP$$$깐양파(소) / 중량: 10kg', boxSize: '소', size: "onionTenS", price: 0 },


    //깐양파  스티로폼 추가 
    '깐양파-사이즈: 아이스박스10kg대': { name: 'naverTenL', description: 'SNP**깐양파(대) icebox/ 중량: 10kg', boxSize: '소', size: "onionTenL", price: 0 },
    '깐양파-사이즈: 아이스박스10kg중': { name: 'naverTenM', description: 'SNP**깐양파(중) icebox/ 중량: 10kg', boxSize: '소', size: "onionTenM", price: 0 },
    '깐양파-사이즈: 아이스박스10kg소': { name: 'naverTenS', description: 'SNP**깐양파(소) icebox/ 중량: 10kg', boxSize: '소', size: "onionTenS", price: 0 },

    //깐마늘 1kg
    '깐마늘-사이즈: 1kg 대': { name: 'naverTenL', description: 'garlic깐마늘(대) / 중량: 1kg', boxSize: '극소', size: "garlicOneL", price: 0 },
    '깐마늘-사이즈: 1kg 중': { name: 'naverTenM', description: 'garlic깐마늘(중) / 중량: 1kg', boxSize: '극소', size: "garlicOneM", price: 0 },
    '깐마늘-사이즈: 1kg 소': { name: 'naverTenS', description: 'garlic깐마늘(소) / 중량: 1kg', boxSize: '극소', size: "garlicOneS", price: 0 },

    // 깐마늘 5키로 추가 !! 
    '깐마늘-사이즈: 5kg 대': { name: 'garlicFiveL', description: 'garlic깐마늘5kg(대) 1개', boxSize: '극소', size: "garlicFiveL", price: 0 },
    '깐마늘-사이즈: 5kg 중': { name: 'garlicFiveM', description: 'garlic깐마늘5kg(중) 1개', boxSize: '극소', size: "garlicFiveM", price: 0 },
    '깐마늘-사이즈: 5kg 소': { name: 'garlicFiveS', description: 'garlic깐마늘5kg(소) 1개', boxSize: '극소', size: "garlicFiveS", price: 0 },

    //깐마늘 10kg
    '깐마늘-사이즈: 10kg 대': { name: 'naverTenL', description: 'garlic깐마늘(대) / 중량: 10kg', boxSize: '소', size: "garlicTenL", price: 0 },
    '깐마늘-사이즈: 10kg 중': { name: 'naverTenM', description: 'garlic깐마늘(중) / 중량: 10kg', boxSize: '소', size: "garlicTenM", price: 0 },
    '깐마늘-사이즈: 10kg 소': { name: 'naverTenS', description: 'garlic깐마늘(소) / 중량: 10kg', boxSize: '소', size: "garlicTenS", price: 0 },


    //깐마늘 20kg
    '깐마늘-사이즈: 20kg 대': { name: 'naverTenL', description: 'garlic깐마늘(대) / 중량: 10kg', boxSize: '소', size: "garlicTwentyL", price: 0, count: 2 },
    '깐마늘-사이즈: 20kg 중': { name: 'naverTenM', description: 'garlic깐마늘(중) / 중량: 10kg', boxSize: '소', size: "garlicTwentyM", price: 0, count: 2 },
    '깐마늘-사이즈: 20kg 소': { name: 'naverTenS', description: 'garlic깐마늘(소) / 중량: 10kg', boxSize: '소', size: "garlicTwentyS", price: 0, count: 2 },

    //깐마늘 20kg
    '(판)깐마늘-사이즈: 20kg 대': { name: 'naverTenL', description: 'garlic깐마늘(대) / 중량: 10kg', boxSize: '소', size: "garlicTwentyL", price: 0, count: 2 },
    '(판)깐마늘-사이즈: 20kg 중': { name: 'naverTenM', description: 'garlic깐마늘(중) / 중량: 10kg', boxSize: '소', size: "garlicTwentyM", price: 0, count: 2 },
    '(판)깐마늘-사이즈: 20kg 소': { name: 'naverTenS', description: 'garlic깐마늘(소) / 중량: 10kg', boxSize: '소', size: "garlicTwentyS", price: 0, count: 2 },


    //당근 3kg , 5kg
    '당근-사이즈: 3kg': { name: 'naverTenL', description: '당근(3kg) / 1box', boxSize: '극소', size: "carrotThree", price: 0 },
    '당근-사이즈: 5kg': { name: 'naverTenL', description: '당근(5kg) / 1box', boxSize: '극소', size: "carrotFive", price: 0 },


    //무 20kg

    '무-사이즈: 5KG': { name: 'coupangPotatoFiveXXL', description: '무-5kg-1box', boxSize: '극소', size: "radishFive", price: 0 },
    '무-사이즈: 10KG': { name: 'coupangPotatoFiveXXL', description: '무-10kg-1box', boxSize: '소', size: "radishTen", price: 0 },
    '무-사이즈: 18~20kg': { name: 'naverTenL', description: '무(18~20kg) / 1box', boxSize: '대', size: "radishTwenty", price: 5000 },

    // 고구마 3kg
    '고구마-사이즈: 3kg(특)': { name: 'naverTenL', description: '고구마(3kg) / 특 / 1box', boxSize: '극소', size: "sweetPotatoXL", price: 0 },
    '고구마-사이즈: 3kg(상)': { name: 'naverTenL', description: '고구마(3kg) / 상 / 1box', boxSize: '극소', size: "sweetPotatoL", price: 0 },
    '고구마-사이즈: 3kg(소)': { name: 'naverTenL', description: '고구마(3kg) / 소 / 1box', boxSize: '극소', size: "sweetPotatoM", price: 0 },
    '고구마-사이즈: 3kg(한입)': { name: 'naverTenL', description: '고구마(3kg) / 한입 / 1box', boxSize: '극소', size: "sweetPotatoS", price: 0 },


    //양배추 추가 3kg, 9kg
    '양배추-사이즈: 3kg(1통)': { name: 'naverTenL', description: '양배추-3kg(1통)', boxSize: '극소', size: "cabbageThree", price: 0 },
    '양배추-사이즈: 9kg(3통)': { name: 'naverTenL', description: '양배추-9kg(3통)', boxSize: '소', size: "cabbageNine", price: 0 },



    //콜라비 추가 
    '콜라비-사이즈: 5kg': { name: 'naverTenL', description: '콜라비(5kg) / 1box', boxSize: '극소', size: "kollabiFive", price: 0 },

    //적양파 추가 



    //적양파 3kg 추가 
    '적양파 사이즈: 3kg 대': { name: 'coupangPotatoFiveXXL', description: '(red)적양파-3kg-(대)', boxSize: '극소', size: "redOnionThreeL", price: 0 },
    '적양파 사이즈: 3kg 중': { name: 'coupangPotatoFiveXXL', description: '(red)적양파-3kg-(중)', boxSize: '극소', size: "redOnionThreeM", price: 0 },
    '적양파 사이즈: 3kg 소': { name: 'coupangPotatoFiveXXL', description: '(red)적양파-3kg-(소)', boxSize: '극소', size: "redOnionThreeS", price: 0 },
    '적양파 사이즈: 3kg 짱아찌': { name: 'coupangPotatoFiveXXL', description: '(red)적양파-3kg-(장아찌)', boxSize: '극소', size: "redOnionThreeS", price: 0 },

    //손질 적양파 3kg 추가 
    '깐적양파-사이즈: 3kg 대': { name: 'coupangPotatoFiveXXL', description: '(red)손질-깐적양파-3kg-(대)', boxSize: '극소', size: "peeledRedOnionThreeL", price: 0 },
    '깐적양파-사이즈: 3kg 중': { name: 'coupangPotatoFiveXXL', description: '(red)손질-깐적양파-3kg-(중)', boxSize: '극소', size: "peeledRedOnionThreeM", price: 0 },
    '깐적양파-사이즈: 3kg 소': { name: 'coupangPotatoFiveXXL', description: '(red)손질-깐적양파-3kg-(소)', boxSize: '극소', size: "peeledRedOnionThreeS", price: 0 },

    //베트남당근 10kg 추가 
    '베트남당근-사이즈: 10kg': { name: 'coupangCarrotTen', description: '베트남당근(중) 10kg', boxSize: '소', size: "carrotTen", price: 0 },

    //감자 5kg
    '감자-사이즈: 5kg(왕특)': { name: 'coupangPotatoFiveXXL', description: '감자(왕특) 5kg', boxSize: '극소', size: "potatoFiveXXL", price: 0 },
    '감자-사이즈: 5kg(특)': { name: 'coupangPotatoFiveXL', description: '감자(특) 5kg', boxSize: '극소', size: "potatoFiveXL", price: 0 },
    '감자-사이즈: 5kg(대)': { name: 'coupangPotatoFiveL', description: '감자(상) 5kg', boxSize: '극소', size: "potatoFiveL", price: 0 },
    '감자-사이즈: 5kg(중)': { name: 'coupangPotatoFiveM', description: '감자(중) 5kg', boxSize: '극소', size: "potatoFiveM", price: 0 },
    '감자-사이즈: 5kg(비품+파지)': { name: 'coupangPotatoFiveM', description: '감자(비품) 5kg', boxSize: '극소', size: "potatoFixturesFive", price: 0 },
    '감자-사이즈: 10kg(비품+파지)': { name: 'coupangPotatoFiveM', description: '감자(비품) 10kg', boxSize: '소', size: "potatoFixturesTen", price: 0 },




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


  const tossProductMappings = {
    '3790171000': { name: 'coupangTenL', description: '합천 햇양파(특) 10kg', boxSize: '소', size: "tenL", price: 0 },
    '3790171': { name: 'coupangTenM', description: '합천 햇양파(대) 10kg', boxSize: '소', size: "tenM", price: 0 },
    '3790173': { name: 'coupangTenS', description: '합천 햇양파(중) 10kg', boxSize: '소', size: "tenS", price: 0 },
    '3790175': { name: 'coupangTenSS', description: '합천 햇양파(소) 10kg', boxSize: '소', size: "tenSS", price: 0 },
    '3790177': { name: 'coupangTenSSS', description: '합천 햇양파(장아찌) 10kg', boxSize: '소', size: "tenSSS", price: 0 },
    // 추가적인 옵션들을 여기에 계속 추가할 수 있습니다.
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

  // Excel 파일 읽기 및 파싱
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
        return coupangProductMappings;
      case 'naver':
        return naverProductMappings;
      case 'gmarket':
        return gmarketProductMappings;
      case 'wemakeprice':
        return wemakepriceProductMappings;
      case 'tiket':
        return tiketProductMappings;
      case 'toss':
        return tossProductMappings;
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
        acc[mapping.size] = (acc[mapping.size] || 0) + sum;
        return acc;
      }, {});
    };

    const totalSums = ['coupang', 'naver', 'gmarket', 'wemakeprice', 'tiket'].reduce((acc, market) => {
      const marketSums = sumQuantities(itemList[market], getMappings(market));
      Object.keys(marketSums).forEach(size => {
        acc[size] = (acc[size] || 0) + marketSums[size];
      });
      return acc;
    }, {});

    useStore.setState((state) => ({ productCounts: { ...state.productCounts, ...totalSums } }));

    console.log("토탈", totalSums);
    console.log("Count", count);
  };

  const onChangeFile = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    readExcel(file, name);
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
    <Page title="에스엔피 오픈마켓">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          에스엔피 오픈마켓 총 합계
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
              data={[
                productCounts.twentyL,
                productCounts.twentyM,
                productCounts.twentyS,
                productCounts.fiveL,
                productCounts.fiveM,
                productCounts.fiveS,
                productCounts.fiveSS,
                productCounts.fiveSSS,
                productCounts.tenL,
                productCounts.tenM,
                productCounts.tenS,
                productCounts.tenSS,
                productCounts.tenSSS,
                productCounts.garlicOneL,
                productCounts.garlicOneM,
                productCounts.garlicOneS,
                productCounts.garlicTenL,
                productCounts.garlicTenM,
                productCounts.garlicTenS,
                productCounts.garlicTwentyL,
                productCounts.garlicTwentyM,
                productCounts.garlicTwentyS,
                productCounts.potatoFiveXXL,
                productCounts.potatoFiveXL,
                productCounts.potatoFiveL,
                productCounts.potatoFiveM,
                productCounts.carrotTen,
                productCounts.onionTenL,
                productCounts.onionTenM,
                productCounts.onionTenS,
                productCounts.realfiveL,
                productCounts.realfiveM,
                productCounts.realfiveS,
                productCounts.realfiveSS,
                productCounts.realfiveSSS,
                productCounts.carrotThree,
                productCounts.carrotFive,
                productCounts.radishTwenty,
                productCounts.sweetPotatoXL,
                productCounts.sweetPotatoL,
                productCounts.sweetPotatoM,
                productCounts.sweetPotatoS,
                productCounts.kollabiFive,
                productCounts.kollabiTen,
                productCounts.kollabiFifteen,
                productCounts.cabbageThree,
                productCounts.cabbageNine,
                marketTotalCount,
                productCounts.redOnionThreeL,
                productCounts.redOnionThreeM,
                productCounts.redOnionThreeS,
                productCounts.peeledRedOnionThreeL,
                productCounts.peeledRedOnionThreeM,
                productCounts.peeledRedOnionThreeS,
                productCounts.onionFixturesFive,
                productCounts.onionFixturesTen,
                productCounts.onionFixturesFifteen,
                productCounts.potatoFixturesFive,
                productCounts.potatoFixturesTen,
                productCounts.garlicFiveL,
                productCounts.garlicFiveM,
                productCounts.garlicFiveS,
                productCounts.realOnionThreeSSS,
                productCounts.realGarlicFiveL,
                productCounts.realGarlicFiveM,
                productCounts.realGarlicFiveS,
                productCounts.realGarlicTenL,
                productCounts.realGarlicTenM,
                productCounts.realGarlicTenS,
                productCounts.realGarlicFiftyL,
                productCounts.realGarlicFiftyM,
                productCounts.realGarlicFiftyS,
                productCounts.radishFive,
                productCounts.radishTen,
                //74부터
                productCounts.hongSanRealGarlicFiveL,
                productCounts.hongSanRealGarlicFiveM,
                productCounts.hongSanRealGarlicFiveS,
                productCounts.hongSanRealGarlicTenL,
                productCounts.hongSanRealGarlicTenM,
                productCounts.hongSanRealGarlicTenS,
                productCounts.hongSanRealGarlicFiftyL,
                productCounts.hongSanRealGarlicFiftyM,
                productCounts.hongSanRealGarlicFiftyS,
                //83부터
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
          토스 파일 선택!!
          <input id="toss" name="toss" type="file" onChange={onChangeFile} />
          자료 : {itemList.toss.length}개
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
}
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import Layout from '../layouts';
import useSettings from '../hooks/useSettings';
import Page from '../components/Page';
import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useTheme, styled, alpha } from '@mui/material/styles';
import merge from 'lodash/merge';
import ReactApexChart, { BaseOptionChart } from '../components/chart';
import { useRouter } from 'next/router';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InventoryIcon from '@mui/icons-material/Inventory';
import TodayIcon from '@mui/icons-material/Today';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// 부드러운 파스텔 색상 팔레트
const PASTEL_COLORS = [
  '#a5b4fc', // 인디고
  '#86efac', // 그린
  '#fcd34d', // 앰버
  '#f9a8d4', // 핑크
  '#7dd3fc', // 스카이
  '#c4b5fd', // 바이올렛
  '#fdba74', // 오렌지
  '#6ee7b7', // 에메랄드
  '#fca5a5', // 레드
  '#a5f3fc', // 시안
];

// 오픈마켓별 부드러운 색상
const getOpenMarketColor = (marketId, index = 0) => {
  const colorPalette = [
    { bg: '#fef3c7', text: '#d97706', accent: '#fbbf24' },
    { bg: '#dbeafe', text: '#2563eb', accent: '#60a5fa' },
    { bg: '#dcfce7', text: '#16a34a', accent: '#4ade80' },
    { bg: '#fce7f3', text: '#db2777', accent: '#f472b6' },
    { bg: '#e0e7ff', text: '#4f46e5', accent: '#818cf8' },
    { bg: '#ffedd5', text: '#ea580c', accent: '#fb923c' },
    { bg: '#d1fae5', text: '#059669', accent: '#34d399' },
    { bg: '#f3e8ff', text: '#9333ea', accent: '#c084fc' },
    { bg: '#cffafe', text: '#0891b2', accent: '#22d3ee' },
    { bg: '#fee2e2', text: '#dc2626', accent: '#f87171' },
  ];
  if (!marketId) return colorPalette[index % colorPalette.length];
  const idx = Math.abs(marketId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colorPalette.length;
  return colorPalette[idx];
};

// 모던 카드 스타일
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
  },
}));

// 통계 카드 스타일 - 미니멀 디자인
const StatCard = styled(Box)(({ color }) => ({
  borderRadius: 16,
  padding: '20px 24px',
  background: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.2s ease',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  border: '1px solid #f1f5f9',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    borderColor: '#e2e8f0',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background: color,
    borderRadius: '16px 0 0 16px',
  },
}));

// 차트 래퍼 스타일
const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: 320,
  marginTop: theme.spacing(2),
  '& .apexcharts-canvas svg': { height: 320 },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    padding: '8px 16px !important',
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${alpha(theme.palette.divider, 0.5)}`,
  },
}));

// 오픈마켓 카드 스타일 - 미니멀 디자인
const MarketCard = styled(Box)(({ color }) => ({
  padding: '16px 20px',
  borderRadius: 12,
  background: '#ffffff',
  border: '1px solid #f1f5f9',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    borderColor: color.accent,
    boxShadow: `0 4px 12px ${alpha(color.accent, 0.15)}`,
    '& .market-icon': {
      transform: 'scale(1.05)',
    },
  },
}));

export default function Home() {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [openMarkets, setOpenMarkets] = useState({});
  const [recentProducts, setRecentProducts] = useState([]);

  // 데이터 로드
  const fetchData = async () => {
    try {
      setLoading(true);

      const openMarketsSnapshot = await getDocs(collection(db, 'open_market'));
      const openMarketsData = {};
      openMarketsSnapshot.docs.forEach(doc => {
        openMarketsData[doc.id] = { name: doc.data().name, tex: doc.data().tex };
      });
      setOpenMarkets(openMarketsData);

      const productsSnapshot = await getDocs(collection(db, 'market_products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null,
      }));
      setProducts(productsData);

      const sortedProducts = [...productsData].sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt - a.createdAt;
      });
      setRecentProducts(sortedProducts.slice(0, 8));

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 오픈마켓별 상품 수 계산
  const marketStats = useMemo(() => {
    const stats = {};
    products.forEach(product => {
      const marketId = product.selectedMarket;
      if (marketId) {
        if (!stats[marketId]) {
          stats[marketId] = { count: 0, totalMargin: 0, name: openMarkets[marketId]?.name || marketId };
        }
        stats[marketId].count += 1;
        stats[marketId].totalMargin += (product.margin || 0) * (product.count || 1);
      }
    });
    return stats;
  }, [products, openMarkets]);

  // 차트 데이터
  const chartData = useMemo(() => {
    const entries = Object.entries(marketStats);
    const labels = entries.map(([, s]) => s.name);
    const series = entries.map(([, s]) => s.count);
    return { labels, series };
  }, [marketStats]);

  // 파이 차트 옵션 - 부드러운 파스텔 색상
  const chartOptions = merge(BaseOptionChart(), {
    colors: PASTEL_COLORS.slice(0, chartData.labels.length),
    labels: chartData.labels,
    stroke: {
      colors: ['#fff'],
      width: 3,
    },
    legend: {
      floating: false,
      horizontalAlign: 'center',
      position: 'bottom',
      fontSize: '13px',
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 8,
      },
    },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
      style: {
        fontSize: '14px',
        fontWeight: 600,
      },
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (val) => `${val}개 상품`,
        title: {
          formatter: (seriesName) => seriesName,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              formatter: (val) => val,
            },
            total: {
              show: true,
              label: '전체 상품',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280',
              formatter: () => products.length,
            },
          },
        },
      },
    },
  });

  // 날짜 포맷
  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  if (loading) {
    return (
      <Page title="SNP SYSTEM">
        <Container maxWidth={themeStretch ? false : 'xl'}>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="60vh"
            gap={2}
          >
            <CircularProgress
              size={48}
              sx={{
                color: '#667eea',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              데이터를 불러오는 중...
            </Typography>
          </Box>
        </Container>
      </Page>
    );
  }

  const totalProducts = products.length;
  const totalMargin = products.reduce((acc, p) => acc + ((p.margin || 0) * (p.count || 1)), 0);
  const marketCount = Object.keys(marketStats).length;
  const todayProducts = recentProducts.filter(p => {
    if (!p.createdAt) return false;
    const today = new Date();
    return p.createdAt.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      title: '전체 상품',
      value: totalProducts,
      icon: <InventoryIcon />,
      color: '#667eea',
      suffix: '개'
    },
    {
      title: '오픈마켓',
      value: marketCount,
      icon: <StorefrontIcon />,
      color: '#10b981',
      suffix: '개'
    },
    {
      title: '예상 마진',
      value: totalMargin,
      icon: <TrendingUpIcon />,
      color: '#f59e0b',
      suffix: '원',
      format: true
    },
    {
      title: '오늘 등록',
      value: todayProducts,
      icon: <TodayIcon />,
      color: '#3b82f6',
      suffix: '개'
    },
  ];

  return (
    <Page title="SNP SYSTEM - 오픈마켓 대시보드">
      <Box sx={{
        minHeight: '100vh',
        py: 3,
        px: { xs: 2, md: 3 }
      }}>
        <Container maxWidth={themeStretch ? false : 'xl'}>
          {/* 헤더 */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#1e293b',
                  letterSpacing: '-0.5px',
                }}
              >
                오픈마켓 대시보드
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                실시간 오픈마켓 현황을 확인하세요
              </Typography>
            </Box>
            <Tooltip title="새로고침">
              <IconButton
                onClick={fetchData}
                sx={{
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': { background: '#f8fafc' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={2}>
            {/* 상단 통계 카드 */}
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <StatCard color={stat.color}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Box sx={{ pl: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748b',
                          fontWeight: 500,
                          mb: 0.5,
                          fontSize: '0.8rem'
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: '#1e293b',
                            fontSize: { xs: '1.5rem', md: '1.75rem' },
                            lineHeight: 1,
                          }}
                        >
                          {stat.format ? stat.value.toLocaleString() : stat.value}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#94a3b8',
                            ml: 0.5,
                          }}
                        >
                          {stat.suffix}
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        background: alpha(stat.color, 0.1),
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                </StatCard>
              </Grid>
            ))}

            {/* 오픈마켓별 상품 분포 - 도넛 차트 */}
            <Grid item xs={12} md={5}>
              <ModernCard sx={{ height: '100%' }}>
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      오픈마켓별 상품 분포
                    </Typography>
                  }
                  sx={{ pb: 0 }}
                />
                <CardContent>
                  {chartData.series.length > 0 ? (
                    <ChartWrapperStyle>
                      <ReactApexChart
                        type="donut"
                        series={chartData.series}
                        options={chartOptions}
                        height={300}
                      />
                    </ChartWrapperStyle>
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 300,
                      color: '#9ca3af'
                    }}>
                      <Typography>데이터가 없습니다</Typography>
                    </Box>
                  )}
                </CardContent>
              </ModernCard>
            </Grid>

            {/* 오픈마켓별 상세 현황 */}
            <Grid item xs={12} md={7}>
              <ModernCard sx={{ height: '100%' }}>
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      오픈마켓별 현황
                    </Typography>
                  }
                  action={
                    <Chip
                      label={`${marketCount}개 마켓`}
                      size="small"
                      sx={{
                        background: alpha('#667eea', 0.1),
                        color: '#667eea',
                        fontWeight: 600,
                      }}
                    />
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ pt: 1 }}>
                  <Grid container spacing={1.5}>
                    {Object.entries(marketStats).map(([marketId, stats], index) => {
                      const color = getOpenMarketColor(marketId, index);
                      return (
                        <Grid item xs={12} sm={6} key={marketId}>
                          <MarketCard
                            color={color}
                            onClick={() => router.push('/market/list')}
                          >
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                  className="market-icon"
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    background: color.bg,
                                    color: color.text,
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    transition: 'transform 0.2s ease',
                                  }}
                                >
                                  {stats.name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      color: '#1e293b',
                                      fontWeight: 600,
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {stats.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: '#64748b' }}
                                  >
                                    {stats.count}개 상품
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    color: '#10b981',
                                    fontWeight: 700,
                                  }}
                                >
                                  +₩{stats.totalMargin.toLocaleString()}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: '#94a3b8' }}
                                >
                                  예상 마진
                                </Typography>
                              </Box>
                            </Box>
                          </MarketCard>
                        </Grid>
                      );
                    })}
                    {Object.keys(marketStats).length === 0 && (
                      <Grid item xs={12}>
                        <Box sx={{
                          textAlign: 'center',
                          py: 4,
                          color: '#9ca3af'
                        }}>
                          <Typography>등록된 오픈마켓이 없습니다</Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </ModernCard>
            </Grid>

            {/* 최근 등록 상품 */}
            <Grid item xs={12}>
              <ModernCard>
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      최근 등록 상품
                    </Typography>
                  }
                  action={
                    <Chip
                      label="전체보기"
                      size="small"
                      onClick={() => router.push('/market/list')}
                      sx={{
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                        },
                      }}
                    />
                  }
                  sx={{ pb: 0 }}
                />
                <TableContainer sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{
                          fontWeight: 600,
                          color: '#64748b',
                          borderBottom: '2px solid #f1f5f9',
                          py: 1.5,
                        }}>
                          오픈마켓
                        </TableCell>
                        <TableCell sx={{
                          fontWeight: 600,
                          color: '#64748b',
                          borderBottom: '2px solid #f1f5f9',
                          py: 1.5,
                        }}>
                          상품명
                        </TableCell>
                        <TableCell sx={{
                          fontWeight: 600,
                          color: '#64748b',
                          borderBottom: '2px solid #f1f5f9',
                          py: 1.5,
                        }}>
                          택배 상품명
                        </TableCell>
                        <TableCell align="right" sx={{
                          fontWeight: 600,
                          color: '#64748b',
                          borderBottom: '2px solid #f1f5f9',
                          py: 1.5,
                        }}>
                          가격
                        </TableCell>
                        <TableCell align="right" sx={{
                          fontWeight: 600,
                          color: '#64748b',
                          borderBottom: '2px solid #f1f5f9',
                          py: 1.5,
                        }}>
                          마진
                        </TableCell>
                        <TableCell sx={{
                          fontWeight: 600,
                          color: '#64748b',
                          borderBottom: '2px solid #f1f5f9',
                          py: 1.5,
                        }}>
                          등록
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentProducts.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            sx={{
                              textAlign: 'center',
                              py: 6,
                              color: '#9ca3af',
                              border: 'none',
                            }}
                          >
                            <Typography>등록된 상품이 없습니다</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentProducts.map((product, index) => {
                          const marketName = openMarkets[product.selectedMarket]?.name;
                          const color = getOpenMarketColor(product.selectedMarket, index);
                          return (
                            <TableRow
                              key={product.id}
                              sx={{
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: '#f8fafc',
                                },
                                '& td': {
                                  borderBottom: '1px solid #f1f5f9',
                                  py: 2,
                                },
                              }}
                              onClick={() => router.push(`/market/product-detail/${product.id}`)}
                            >
                              <TableCell>
                                {marketName ? (
                                  <Chip
                                    label={marketName}
                                    size="small"
                                    sx={{
                                      height: 26,
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      backgroundColor: color.bg,
                                      color: color.text,
                                      border: `1px solid ${alpha(color.accent, 0.3)}`,
                                    }}
                                  />
                                ) : (
                                  <Typography variant="body2" color="text.secondary">-</Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: '#1e293b' }}
                                >
                                  {product.registeredProductName || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                  {product.deliveryProductName || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  ₩{product.productPrice?.toLocaleString() || 0}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: '#10b981',
                                    fontWeight: 700,
                                  }}
                                >
                                  +₩{product.margin?.toLocaleString() || 0}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatDate(product.createdAt)}
                                  size="small"
                                  sx={{
                                    height: 24,
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    backgroundColor: '#f1f5f9',
                                    color: '#64748b',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ModernCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Page>
  );
}

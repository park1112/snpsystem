import { Container, Typography, } from '@mui/material';
import Layout from '../../../layouts';
import Page from '../../../components/Page';
import ProductRegistration from '../../../components/ProductRegistration';


const PaymentConfirmation = () => {

  return (
    <Page title="Payment Confirmation">
      <Container maxWidth="lg">


        <Typography variant="h5" gutterBottom>단가 및 결제 정보 입력</Typography>
        <ProductRegistration />

      </Container>
    </Page>
  );
};

PaymentConfirmation.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default PaymentConfirmation;

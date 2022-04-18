// @mui
import { Stack, Button, Typography } from '@mui/material';
// assets
import { DocIllustration } from '../../../assets';

// ----------------------------------------------------------------------

export default function NavbarDocs() {
  return (
    <Stack spacing={3} sx={{ px: 5, pb: 5, mt: 10, width: 1, textAlign: 'center', display: 'block' }}>
      <DocIllustration sx={{ width: 1 }} />

      <div>
        <Typography gutterBottom variant="subtitle1">
          환영합니다. 에스엔피님
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          무엇을 도와드릴까요 ?
          <br /> 도움이 필요하면 밑에 배너를 클릭하세요!
        </Typography>
      </div>

      <Button variant="contained">상담원 연결</Button>
    </Stack>
  );
}

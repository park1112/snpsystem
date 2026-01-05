import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

RejectionFiles.propTypes = {
    fileRejections: PropTypes.array.isRequired,
};

export default function RejectionFiles({ fileRejections }) {
    return (
        <Box>
            {fileRejections.map(({ file, errors }) => (
                <Box key={file.path} sx={{ mt: 2 }}>
                    <Typography variant="body2" color="error">
                        {file.path} - {file.size} bytes
                    </Typography>
                    <Box>
                        {errors.map((e) => (
                            <Typography key={e.code} variant="caption" color="error">
                                {e.message}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

import PropTypes from 'prop-types';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

MultiFilePreview.propTypes = {
    files: PropTypes.array.isRequired,
    showPreview: PropTypes.bool,
    onRemove: PropTypes.func.isRequired,
    onRemoveAll: PropTypes.func.isRequired,
};

export default function MultiFilePreview({ files = [], showPreview, onRemove, onRemoveAll }) {
    if (!Array.isArray(files) || files.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
                {files.map((file, index) => (
                    <Grid item xs={3} key={index}>
                        <Box sx={{ position: 'relative' }}>
                            {showPreview && (
                                <img
                                    src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                                    alt={`file preview ${index}`}
                                    style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                />
                            )}
                            <IconButton
                                onClick={() => onRemove(file)}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton color="error" onClick={onRemoveAll}>
                    <DeleteIcon />
                    <Typography variant="body2" color="error" sx={{ ml: 1 }}>
                        모두 삭제
                    </Typography>
                </IconButton>
            </Box>
        </Box>
    );
}

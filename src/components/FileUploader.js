import React from 'react';
import { Typography } from '@mui/material';

const FileUploader = ({ name, onChange, count }) => (
    <Typography>
        {name} 파일 선택!!
        <input id={name} name={name} type="file" onChange={onChange} />
        수량 : {count}개
    </Typography>
);

export default FileUploader;

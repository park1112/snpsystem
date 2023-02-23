import 'package:flutter/material.dart';


// 세로 그라데이션
const GRADIENT = [Color(0xFF20c257), Color(0xFF12d8b4)];

// 주색상
const PRIMARY_COLOR = Color(0xFF19cc83);
// 밝은녹색
const BODY_TEXT_COLOR = Color(0xFF868686);
// 텍스트필드 배경 색상
const INPUT_BG_COLOR = Color(0xFFFBFBFB);
// 텍스트필드 테두리 색상
const INPUT_BORDER_COLOR = Color(0xFFF3F2F2);

const WHITE_BG_COLOR = Color(0xFFFFFFFF);

const KAKAO_COLOR = Color(0xFFfedd36);

const DIVIDER_COLOR = Color(0xFFd9d9d9);

const TEXT_GRAY_COLOR = Color(0xff909090);


const PRIMARY_GRADIENT = BoxDecoration(
    gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: GRADIENT
    )
);

const PRIMARY_GRADIENT_H = BoxDecoration(
    gradient: LinearGradient(
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
        colors: GRADIENT
    )
);
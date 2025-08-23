#!/bin/bash

echo "🛑 AI 면접 분석 서비스 중지 중..."

# PID 파일에서 프로세스 ID 읽기
if [ -f "s3_api.pid" ]; then
    S3_API_PID=$(cat s3_api.pid)
    echo "📤 S3 API 중지 (PID: $S3_API_PID)..."
    kill $S3_API_PID 2>/dev/null || echo "S3 API 프로세스를 찾을 수 없습니다."
    rm -f s3_api.pid
else
    echo "S3 API PID 파일을 찾을 수 없습니다."
fi

if [ -f "ai_api.pid" ]; then
    AI_API_PID=$(cat ai_api.pid)
    echo "🤖 AI 분석 API 중지 (PID: $AI_API_PID)..."
    kill $AI_API_PID 2>/dev/null || echo "AI 분석 API 프로세스를 찾을 수 없습니다."
    rm -f ai_api.pid
else
    echo "AI 분석 API PID 파일을 찾을 수 없습니다."
fi

if [ -f "auto_analyzer.pid" ]; then
    AUTO_ANALYZER_PID=$(cat auto_analyzer.pid)
    echo "⏰ 자동 분석 스케줄러 중지 (PID: $AUTO_ANALYZER_PID)..."
    kill $AUTO_ANALYZER_PID 2>/dev/null || echo "자동 분석 스케줄러 프로세스를 찾을 수 없습니다."
    rm -f auto_analyzer.pid
else
    echo "자동 분석 스케줄러 PID 파일을 찾을 수 없습니다."
fi

# 추가로 실행 중인 프로세스 확인 및 중지
echo "🔍 실행 중인 프로세스 확인..."
pkill -f "simple_s3_api.py" 2>/dev/null && echo "S3 API 프로세스 중지됨"
pkill -f "ai_analysis_api.py" 2>/dev/null && echo "AI 분석 API 프로세스 중지됨"
pkill -f "auto_analyzer.py" 2>/dev/null && echo "자동 분석 스케줄러 프로세스 중지됨"

echo ""
echo "✅ 모든 AI 면접 분석 서비스가 중지되었습니다!"
echo ""
echo "📝 서비스 재시작: ./start_ai_services.sh" 
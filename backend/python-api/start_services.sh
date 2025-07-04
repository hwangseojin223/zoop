#!/bin/bash

# ZOOP Backend Services Startup Script

echo "🚀 ZOOP Backend Services를 시작합니다..."

# Chatbot Service (Port 8000)
echo "📱 Chatbot Service 시작 중... (Port 8000)"
cd chatbot
if [ ! -f ".env" ]; then
    echo "⚠️  .env 파일이 없습니다. chatbot/.env 파일을 생성해주세요."
    echo "예시:"
    echo "OPENAI_API_KEY=your_api_key_here"
    echo "PDF_PATH=채용_관리자_가이드.pdf"
    echo "OPENAI_MODEL=gpt-4o-mini"
fi

# 백그라운드에서 chatbot 서비스 시작
uvicorn chatbot_api:app --host 0.0.0.0 --port 8000 --reload &
CHATBOT_PID=$!
echo "✅ Chatbot Service 시작됨 (PID: $CHATBOT_PID)"

# GitHub Search Service (Port 8081)
echo "🔍 GitHub Search Service 시작 중... (Port 8081)"
cd ../github_search
if [ ! -f ".env" ]; then
    echo "⚠️  .env 파일이 없습니다. github_search/.env 파일을 생성해주세요."
    echo "예시:"
    echo "OPENAI_API_KEY=your_api_key_here"
fi

# 백그라운드에서 github search 서비스 시작
uvicorn main:app --host 0.0.0.0 --port 8081 --reload &
GITHUB_PID=$!
echo "✅ GitHub Search Service 시작됨 (PID: $GITHUB_PID)"

echo ""
echo "🎉 모든 서비스가 시작되었습니다!"
echo "📱 Chatbot Service: http://localhost:8000"
echo "🔍 GitHub Search Service: http://localhost:8081"
echo ""
echo "서비스를 중지하려면:"
echo "kill $CHATBOT_PID $GITHUB_PID"
echo ""
echo "로그 확인:"
echo "tail -f chatbot/logs.txt github_search/logs.txt"

# 서비스 상태 모니터링
while true; do
    if ! kill -0 $CHATBOT_PID 2>/dev/null; then
        echo "❌ Chatbot Service가 중단되었습니다."
        break
    fi
    if ! kill -0 $GITHUB_PID 2>/dev/null; then
        echo "❌ GitHub Search Service가 중단되었습니다."
        break
    fi
    sleep 5
done 
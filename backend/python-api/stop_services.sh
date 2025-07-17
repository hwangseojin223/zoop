#!/bin/bash

# Python API 서비스들을 중지하는 스크립트

echo "Stopping Python API services..."

# 저장된 프로세스 ID들을 읽어서 중지
if [ -f /tmp/interview_api.pid ]; then
    INTERVIEW_PID=$(cat /tmp/interview_api.pid)
    if kill -0 $INTERVIEW_PID 2>/dev/null; then
        kill $INTERVIEW_PID
        echo "✓ Interview Analysis API stopped"
    else
        echo "✗ Interview Analysis API was not running"
    fi
    rm /tmp/interview_api.pid
fi

if [ -f /tmp/portfolio_api.pid ]; then
    PORTFOLIO_PID=$(cat /tmp/portfolio_api.pid)
    if kill -0 $PORTFOLIO_PID 2>/dev/null; then
        kill $PORTFOLIO_PID
        echo "✓ Portfolio Matching API stopped"
    else
        echo "✗ Portfolio Matching API was not running"
    fi
    rm /tmp/portfolio_api.pid
fi

if [ -f /tmp/chatbot_api.pid ]; then
    CHATBOT_PID=$(cat /tmp/chatbot_api.pid)
    if kill -0 $CHATBOT_PID 2>/dev/null; then
        kill $CHATBOT_PID
        echo "✓ Chatbot API stopped"
    else
        echo "✗ Chatbot API was not running"
    fi
    rm /tmp/chatbot_api.pid
fi

if [ -f /tmp/github_api.pid ]; then
    GITHUB_PID=$(cat /tmp/github_api.pid)
    if kill -0 $GITHUB_PID 2>/dev/null; then
        kill $GITHUB_PID
        echo "✓ GitHub Search API stopped"
    else
        echo "✗ GitHub Search API was not running"
    fi
    rm /tmp/github_api.pid
fi

if [ -f /tmp/questions_api.pid ]; then
    QUESTIONS_PID=$(cat /tmp/questions_api.pid)
    if kill -0 $QUESTIONS_PID 2>/dev/null; then
        kill $QUESTIONS_PID
        echo "✓ Interview Questions API stopped"
    else
        echo "✗ Interview Questions API was not running"
    fi
    rm /tmp/questions_api.pid
fi

if [ -f /tmp/ocr_api.pid ]; then
    OCR_PID=$(cat /tmp/ocr_api.pid)
    if kill -0 $OCR_PID 2>/dev/null; then
        kill $OCR_PID
        echo "✓ OCR API stopped"
    else
        echo "✗ OCR API was not running"
    fi
    rm /tmp/ocr_api.pid
fi

# 포트를 사용하는 모든 Python 프로세스 강제 종료 (필요시)
echo "Checking for any remaining Python processes on API ports..."
pkill -f "uvicorn.*8001" 2>/dev/null && echo "✓ Killed remaining processes on port 8001"
pkill -f "uvicorn.*8002" 2>/dev/null && echo "✓ Killed remaining processes on port 8002"
pkill -f "python.*chatbot_api.py" 2>/dev/null && echo "✓ Killed remaining chatbot processes"
pkill -f "python.*main.py" 2>/dev/null && echo "✓ Killed remaining github search processes"
pkill -f "python.*interview_questions_api.py" 2>/dev/null && echo "✓ Killed remaining questions processes"
pkill -f "python.*ocr_api.py" 2>/dev/null && echo "✓ Killed remaining OCR processes"

echo "All Python API services stopped!" 
@echo off
chdir /d "%~dp0"
echo 启动 ToyLab 业务接口 (toylab-service)，端口 8001
echo 管理端编辑案例、开发日志保存均依赖此服务。请保持窗口打开。
echo.
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
pause

@echo off
title Servidor Backend - SIGA Enterprise (Gestion Avicola)
color 2F
echo =====================================================================
echo    SERVIDOR EMPRESARIAL DE GESTION AVICOLA - SIGA ENTERPRISE
echo =====================================================================
echo.
echo  Detectando direccion IP local para sincronizacion de campo...
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    set LOCAL_IP=%%a
)
echo.
echo  [OK] El servidor estara disponible en la red Wi-Fi en:
echo       http://%LOCAL_IP%:8000/api/v1
echo       Documentacion Swagger: http://%LOCAL_IP%:8000/docs
echo.
echo  (Asegurate de que los dispositivos moviles esten conectados a la misma red)
echo.
echo =====================================================================
echo.
cd /d "%~dp0backend"
python -c "import fastapi, uvicorn" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [AVISO] Instalando dependencias de FastAPI y Uvicorn necesarias...
    python -m pip install -r requirements.txt
    echo  [OK] Dependencias instaladas con exito.
    echo.
)
python run.py
pause

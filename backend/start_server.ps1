# Starts the website-offer backend (serves API + built frontend) on a fixed
# local port. Point the Cloudflare Tunnel Public Hostname at this port.
Set-Location "C:\Users\Admin\Desktop\webite_offer\backend"
& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8010

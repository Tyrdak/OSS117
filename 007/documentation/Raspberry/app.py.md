```python 
#!/usr/bin/env python3

import socket, requests, time, subprocess
from gpiozero import MotionSensor
from datetime import datetime

# Configuration des variables
pin_out = MotionSensor(20)
url = "https://007-api.vercel.app/api/motion"
host = socket.gethostname()
key = "feur"

# Recuperer l'url de cloudflareddddd
def get_url():
    cmd = "journalctl -u cloudflared-quick.service -n 100 | grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return(result.stdout[:-1])

#Api de localisation wifi
def geoloc(ipaddr: str):
    api = f"http://ipinfo.io/{ipaddr}/json"
    response = requests.get(api)
    data = response.json()
    return (data.get('loc'))

# Envoie des events
def send_event(event: str):
    data = {"loc": geoloc("83.142.150.170"), "Msg": event, "Host": host, "Url": get_url(), "Key": key}
    try:
        r = requests.post(url, data)
        print(f"[POST {r.status_code}] {event}")
        print(data)
    except Exception as e:
        print(f"[ERROR] {e}")

# Detecte le changement de level du gpio
def on_motion():
    send_event("Vodka-Martini")

# Lancement
def main():
    print("Go go go !!!")
    pin_out.when_motion = on_motion
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
```
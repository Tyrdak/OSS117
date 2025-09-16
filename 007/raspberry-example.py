import socket, requests, time
from gpiozero import MotionSensor
from datetime import datetime
import json

# Configuration des variables
pin_out = MotionSensor(20)
url = "https://jamesbond007.vercel.app/api/motion"
host = socket.gethostname()
key = "feur"

# Coordonnées GPS simulées (remplacez par vos vraies coordonnées)
GPS_LATITUDE = 48.8566  # Paris par exemple
GPS_LONGITUDE = 2.3522
GPS_ALTITUDE = 35.0
GPS_ACCURACY = 5.0  # Précision en mètres

def get_gps_coordinates():
    """
    Récupère les coordonnées GPS actuelles.
    Remplacez cette fonction par votre vraie implémentation GPS.
    """
    # Ici vous pouvez intégrer un module GPS réel comme:
    # - GPSD (gpsd)
    # - Module GPS via UART
    # - API de géolocalisation IP
    # - Coordonnées fixes si le Raspberry Pi est statique
    
    return {
        "lat": GPS_LATITUDE,
        "lon": GPS_LONGITUDE,
        "alt": GPS_ALTITUDE,
        "accuracy": GPS_ACCURACY
    }

def send_event(event: str):
    now = datetime.now()
    formatted = now.strftime("%d-%m %H:%M:%S")
    
    # Récupérer les coordonnées GPS
    gps = get_gps_coordinates()
    
    # Préparer les données avec plus de détails
    data = {
        "Key": key,
        "Msg": event,
        "Host": host,
        "date": formatted,
        "lat": gps["lat"],
        "lon": gps["lon"],
        "alt": gps["alt"],
        "accuracy": gps["accuracy"],
        # Ajouter des métadonnées utiles
        "timestamp": now.isoformat(),
        "timezone": "Europe/Paris",
        "version": "1.0"
    }
    
    try:
        # Envoyer en JSON (recommandé)
        r = requests.post(url, json=data, timeout=10)
        if r.status_code == 200:
            print(f"[✅ POST {r.status_code}] {event} - GPS: {gps['lat']:.6f}, {gps['lon']:.6f} - Précision: ±{gps['accuracy']}m")
        else:
            print(f"[❌ POST {r.status_code}] {event} - Erreur: {r.text}")
        
    except requests.exceptions.Timeout:
        print(f"[⏰ TIMEOUT] {event} - GPS: {gps['lat']:.6f}, {gps['lon']:.6f}")
    except requests.exceptions.ConnectionError:
        print(f"[🔌 CONNECTION ERROR] {event} - GPS: {gps['lat']:.6f}, {gps['lon']:.6f}")
    except Exception as e:
        print(f"[💥 ERROR] {e}")

def on_motion():
    send_event("Vodka-Martini")

def main():
    print("🚀 Agent 007 - Surveillance GPS activée!")
    print(f"📍 Position: {GPS_LATITUDE:.6f}, {GPS_LONGITUDE:.6f}")
    print(f"🎯 Précision: ±{GPS_ACCURACY}m")
    print("👁️  Détection de mouvement en cours...")
    
    pin_out.when_motion = on_motion
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Arrêt du système de surveillance")
        pass

if __name__ == "__main__":
    main()

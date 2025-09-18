# Documentation technique – Détection PIR → webhook HTTP
![alt text](image.png)

## Objet

Détection de mouvement via capteur PIR (GPIO Raspberry Pi) et émission d’un événement HTTP vers une API externe, incluant :
* Hôte (hostname),
* Géolocalisation approximative (via IP publique),
* URL de tunnel Cloudflare (extrait des journaux systemd).

## Dépendances

* **Matériel** : Raspberry Pi + PIR (OUT → GPIO 20 BCM).
* **OS** : Raspberry Pi OS.
* **Python** : ≥ 3.9 avec `gpiozero`, `requests`.
* **Service** : `cloudflared` (URL tunnel).

> Note GPIO : numérotation BCM, droits via groupe gpio.

## Fonctionnement

1. Capteur PIR déclenche `when_motion`.
2. Script récupère :

   * **loc** via `ipinfo.io`,
   * **URL** Cloudflare via `journalctl`,
   * **hostname**.
3. Envoi POST vers `https://007-api.vercel.app/api/motion`.

## Payload

```json
{
  "loc": "lat,lon",
  "Msg": "Vodka-Martini",
  "Host": "<hostname>",
  "Url": "https://xxxx.trycloudflare.com",
  "Key": "feur"
}
```

## Points clés

* Géoloc IP ≠ GPS (faible précision).
* Parsing journaux Cloudflare fragile.
* PIR → ajouter un délai anti-rebonds.
* Secrets → uniquement via env.
* À externaliser dans des variables d’environnement :
  * `MOTION_GPIO=20`
  * `WEBHOOK_URL=https://007-api.vercel.app/api/motion`
  * `CF_SYSTEMD_UNIT=cloudflared-quick.service`
  * `API_KEY=feur`

## Lancement automatique (*systemd*)

Pour que notre jamesbond, n'est pas à devoir se connecter au raspberry et lancer le script, nous l'avons declaré comme un service, avec systemd.

# Documentation technique – API Flask localisation & état

## Objet

Mettre en service une API Flask. Le serveur applicatif est géré par Gunicorn (WSGI) et l’accès public est fourni par un tunnel Cloudflare, ce qui évite toute exposition directe des ports sur Internet.

## Dépendances

* **Python** : ≥ 3.9
* **Libs** : `flask`, `flask-cors`, `requests`, `gunicorn`.
* **Service externe** : `ipinfo.io` (géoloc IP), `Cloudlared` (tunnel)

## Architecture

Les clients externes se connectent en HTTPS à une URL Cloudflare.
Cloudflared relaie les requêtes localement vers Gunicorn, qui exécute l’application Flask.
L’application n’écoute jamais directement sur une interface publique, uniquement sur l’adresse locale.

## Fonctionnement

1. **CORS** activé, par défaut sur toutes les origines : `*`.
2. **Routes disponibles** :
   * `/` : racine, liste des routes.
   * `/alive` : état du service (`{"Run":"ON","Batterie":""}`).
   * `/loc` : renvoie `{"loc": "lat,lon"}` via IP fixe (`83.142.150.170`).

## Déploiement avec Gunicorn

En production, Flask n’est pas lancé directement. L’application est servie par Gunicorn, qui gère les processus, les threads et la mise à l’échelle.
Gunicorn doit être configuré pour n’écouter que sur l’adresse 127.0.0.1 (loopback), de manière à ce que seules les connexions locales soient possibles. Le service est ensuite supervisé par systemd avec un redémarrage automatique en cas d’erreur.

## Points d'amelioration clés

* **Sécurité** : restreindre `ALLOWED_ORIGINS` en production (éviter `*`).
* **Géoloc IP** : dépendant de `ipinfo.io`, précision ville/région.
* **Externalisation de variables** : 
    * `ALLOWED_ORIGINS` : liste d’origines autorisées pour CORS (séparées par `,`).
* **Quick Tunnel vers Tunnel nommé** : Une configuration persistante à un domaine stable, contrairement à la solution actuelle.

## Exemple de réponse `/loc`

```json
{
  "loc": "48.8534,2.3488"
}
```



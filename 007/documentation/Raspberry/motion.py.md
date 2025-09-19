```python
#/usr/bin/env python3 

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests

app = Flask(__name__)

allowed = os.getenv("ALLOWED_ORIGINS")
if allowed:
    origins = [o.strip() for o in allowed.split(",") if o.strip()]
else:
    origins = "*"

CORS(
    app,
    resources={r"/*": {"origins": origins}},
    supports_credentials=False,
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    max_age=86400,
)

@app.route("/loc", methods=["GET"], strict_slashes=False)
def loc():
    ip = "83.142.150.170"
    url = f"http://ipinfo.io/{ip}/json"
    response = requests.get(url)
    data = response.json()
    return ({"loc" : data.get('loc')})

@app.get("/alive")
def alive():
    return({"Run" : "ON", "Batterie" : ""})

@app.get("/")
def root():
    return jsonify(ok=True, routes=["/alive", "/loc"])

```
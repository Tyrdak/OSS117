[⬅️ Retour au README](../../README.md)

# 📝 Description Générale

---

## 🏗️ Architecture cible
Capteur PIR → **Raspberry Pi 3A** (script Python) → **envoi JSON via PHP** → **site web privé** → affichage & logs.

---

## ⚙️ Comportement attendu
- 📡 Détection dans un rayon de **3 m**  
- ⏱️ Envoi d’un **JSON contenant la timestamp**  
- ⌛ Délai entre alertes : **3 s**  
- 🔄 Cooldown : **3 s**  

---

## 🛠️ Technologies utilisées
- Raspberry Pi 3A  
- Capteur PIR  
- Python (`gpiozero` / `RPi.GPIO`)  
- PHP  
- Hébergement site web privé  

---

## 📅 Planning et jalons

### 📍 J1 (15/09)
- 🧠 Brainstorming pour trouver l’idée du projet  
- 💡 Décision : **détecteur de mouvement caché dans un talon de chaussure** (facile à retirer et à monter)  
- 🔧 Travail initial sur Arduino → problème d’intégration du Wi-Fi  
- 🔄 Reprise avec **Raspberry Pi 3A** (Wi-Fi intégré)  
- 💻 Installation de **Raspberry OS**  

---

### 📍 J2 (16/09)
- 🔌 Intégration du capteur **PIR** avec le Raspberry Pi 3A  
- 📡 Réglage du PIR → portée **≈3 m**, délai **3 s**  
- 🌐 (Mael) Création du **site web** pour afficher l’état du Raspberry et journal des détections  
- 🔗 (Théo) Développement du **code de communication** entre Raspberry et site web  

---

### 📍 J3 (17/09)
- 🖨️ Impression 3D des talons après modélisation  
  - 1ère version annulée (optimisation temps d’impression)  
  - 2ème version annulée (erreur technique imprimante 3D)  
  - ✅ 3ème version terminée en **6h30**  
- 🐞 Résolution des bugs Raspberry & site → **transmission de données fonctionnelle**  

---

### 📍 J4 (18/09)
- 🔩 Assemblage final du prototype (Raspberry + capteur PIR + talon imprimé + batterie)  
- 🧪 Tests réussis avec le Raspberry directement intégré dans le talon → fonctionnement validé  
- 🌐 Interface inchangée (thème James Bond déjà en place depuis J2)  
- 🐞 Petit bug site web lors de la préparation de la démo → corrigé en 30 min  
- 🛠️ Fignolage : améliorations, corrections mineures et documentation  
- 🎥 Réalisation de la **vidéo de démonstration** + préparation des **slides** pour la présentation finale  

---

### 📍 J5 (19/09) – Démonstration finale
- 🎥 Présentation du prototype fonctionnel devant le jury  

---

## 💰 Budget et ressources
- **Budget :** 0 € (matériel fourni)  
- **Ressources humaines :** 4 étudiants  

**Compétences mobilisées :**
- Python embarqué  
- GPIO  
- HTTP  
- Hébergement  
- Documentation  
- JavaScript/TypeScript (frontend et backend)
- React (développement d’interface utilisateur)
- API REST (création et consommation)
- Supabase (gestion de base de données cloud)
- SQL (modélisation et requêtes)
- Vite (outillage et bundling frontend)
- Gestion d’événements temps réel
- Sécurité web (authentification, protection des données)
- Débogage et tests (frontend et backend)
- Documentation technique avancée
- Intégration continue/déploiement (Vercel)
- Utilisation d’outils de versioning (Git)

---

## ⚠️ Analyse des risques

### 🔎 Risques identifiés
- Wi-Fi instable  
- Autonomie batterie limitée  
- Faux positifs du PIR  
- Bug logiciel  
- Indisponibilité du site web  
- Taille du prototype

### 🛡️ Stratégies de mitigation
- Journalisation locale  
- Batterie de plus grande capacité  
- Réglage des seuils PIR  
- Logs d’erreurs détaillés  
- Démo offline en secours  
- miniaturisation du gadget
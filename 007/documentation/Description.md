# Description Générale
Architecture cible : Capteur PIR → Raspberry Pi 3A (script Python) → envoi JSON via PHP vers site web privé → affichage/logs.
## Comportement attendu :
 - Détection dans un rayon de 3 m.
 - Envoi d’un JSON contenant la timestamp.
 - Délai entre alertes : 3 s.
 - Cooldown : 3 s.
## Technologies : 
Raspberry Pi 3A, Capteur PIR, Python (gpiozero/RPi.GPIO), PHP, hébergement site web privé.
## Planning et jalons
### J1 (15/09) 
début du projet. Brainstorm pour trouver l'idée du projet. Une décision commune fut atteinte pour un détecteur de mouvement qui serait caché dans le talon de chaussures et facilement retirable et montable. 
Travail initial sur un Arduino, des problèmes ont été rencontrés lors de la tentative d'intégrer la carte wifi à l'Arduino. Nous avons décidé de recommencer en partant cette fois à partir du Raspberry Pi 3A qui a un module wifi intégré. Nous avons installé Raspberry OS avant de finir la journée.

### J2 (16/09) 
Nous avons réussi à intégrer le détecteur de mouvement à infrarouge PIR initialement prévue pour l'installation avec l'Arduino avec cette fois-ci le Raspberry Pi 3A. Après quelques recherches et tests, la connexion entre les deux fut faite le PIR réglé pour détecter des mouvement à approximativement 3 mètres et envoyer un signal avec 3 secondes de délais. (MAEL) Création d'un site web auquel l'utilisateur aura accès afin de connaitre l'état du ou des Raspberry(ies) déployés et accéder au journal indiquant s'il y a eu un mouvement détecté et quand. 
(Théo) Création du code permettant au Raspberry de communiquer avec le site WEB 
### J3 (17/09)
Impression 3D des talons après modélisation. 1ère version annulée afin d'optimiser le modèle pour gagner du temps d'impression. 2eme annulée à cause d'une erreur technique dans l'imprimante 3D. 3ème version finie en 6h30. Résolution des bugs au niveau de Raspberry et du site pour que la transmission de données se fasse.

### J4 (18/09)

### J5 (19/09) démonstration finale

# Budget et ressources
Budget : 0 € (matériel fourni)
Ressources humaines : 4 étudiants

Compétences : Python embarqué, GPIO, HTTP, hébergement, documentation.

# Analyse des risques
Risques identifiés : Wi-Fi instable, autonomie batterie, faux positifs PIR, bug logiciel, indisponibilité du site web.
Mitigation : journalisation locale, batterie plus grande, réglage seuils PIR, logs d’erreurs, démo offline en secours.


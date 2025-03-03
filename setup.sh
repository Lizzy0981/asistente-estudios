#!/bin/bash

# Crear estructura de directorios
mkdir -p asistente-estudios/data

# Cambiar al directorio del proyecto
cd asistente-estudios

# Crear los archivos principales
touch app.py
touch index.html
touch app.js
touch requirements.txt
touch README.md
touch vercel.json

# Crear archivo .gitkeep en la carpeta data para mantenerla en el repositorio
touch data/.gitkeep

# Crear un archivo de ejemplo en la carpeta data
touch data/user_sample.json

# Inicializar repositorio Git (opcional)
git init

echo "Estructura de directorios y archivos creada con éxito."
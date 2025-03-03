# 🧠 Asistente de Estudios con Gestión de Energía Mental

Una aplicación única e innovadora que optimiza tu tiempo de estudio según tus patrones personales de energía mental, ayudándote a maximizar tu productividad y rendimiento académico.

## 📱 Imágenes de la Aplicación 📱

![Asistente de Estudios - Interfaz Principal](https://github.com/user-attachments/assets/e04f3db8-af37-49d4-9df8-d1eccfe21a19)

*Imagen de captura de pantalla de la aplicación desplegada.*

## ✨ Características

- 📊 Seguimiento personalizado de tus niveles de energía mental durante el día
- 🧩 Recomendaciones adaptativas basadas en tu patrón único de productividad
- 📝 Gestión inteligente de tareas que considera la demanda de energía de cada actividad
- 📈 Visualización gráfica de la correlación entre energía y productividad
- 🔄 Sistema de optimización que aprende de tus hábitos de estudio
- 📱 Diseño responsive adaptable a todos los dispositivos
- 🌙 Modo offline para trabajar sin conexión a internet
- 📊 Análisis detallado de tus sesiones de estudio con métricas de rendimiento

## 🛠️ Tecnologías utilizadas

- 🐍 Python con Flask para el backend y API REST
- 💻 HTML5, CSS3 y JavaScript (ES6+) para el frontend
- 🎨 Tailwind CSS para un diseño moderno y responsive
- 📊 Chart.js para visualizaciones de datos interactivas
- 💾 Sistema de almacenamiento basado en JSON (escalable a bases de datos)
- ☁️ Diseñado para fácil despliegue en Vercel
- 📊 Algoritmos de análisis de datos para optimización de horarios

## ✨ Efectos y Análisis de Datos

- 📊 Gráficos interactivos que muestran la correlación entre energía y productividad
- 🌡️ Indicadores visuales de nivel de energía con gradientes de color
- 📅 Distribución optimizada de tareas según patrones de energía
- 🔄 Ajuste adaptativo de recomendaciones basado en datos históricos
- 📈 Análisis de tendencias para identificar los mejores momentos para diferentes tipos de tareas
- 🏆 Sistema de puntuación para evaluar la efectividad de las sesiones de estudio
- 🔍 Visualización de métricas clave para mejorar hábitos de estudio

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Lizzy0981/asistente-estudios.git
```

2. Instala las dependencias:
```bash
cd asistente-estudios
pip install -r requirements.txt
```

3. Inicia el servidor:
```bash
python app.py
```

4. Abre tu navegador y ve a `http://localhost:5000`

5. También puedes acceder a la versión desplegada [aquí](https://asistente-estudios.vercel.app/).

## 💡 Uso

1. Crea tu perfil único (se genera automáticamente un ID para ti)
2. Registra tus sesiones de estudio incluyendo:
   - Tema/materia
   - Duración
   - Nivel de energía (1-10)
   - Productividad percibida (1-10)
   - Notas adicionales
3. Añade tus tareas pendientes con:
   - Título y descripción
   - Fecha límite
   - Nivel de energía requerido (1-10)
4. Revisa tus recomendaciones personalizadas:
   - Horario óptimo según tus patrones de energía
   - Consejos generales para mejorar tu estudio
   - Distribución inteligente de tareas en momentos ideales

## 📊 Ciencia detrás de la aplicación

Esta aplicación se basa en investigaciones sobre **cronobiología** y **productividad cognitiva** que demuestran que:

> Cada persona tiene patrones únicos de energía mental a lo largo del día, y alinear las tareas con estos patrones puede aumentar significativamente la productividad y retención de información.

La aplicación utiliza algoritmos adaptativos que:

1. Capturan datos sobre tus niveles de energía y productividad
2. Identifican patrones personales a través del tiempo
3. Optimizan la distribución de tareas según su demanda cognitiva
4. Ajustan recomendaciones basadas en resultados previos

## 🗂️ Estructura del proyecto

```
asistente-estudios/
│
├── app.py                  # Servidor backend (Flask)
├── static/                 # Directorio para archivos estáticos
│   └── app.js              # Lógica JavaScript del frontend
├── data/                   # Almacenamiento de datos de usuario (JSON)
│   ├── .gitkeep            # Mantiene la carpeta en Git
│   └── user_sample.json    # Ejemplo de datos de usuario
├── index.html              # Interfaz de usuario principal
├── requirements.txt        # Dependencias de Python
├── vercel.json             # Configuración para despliegue en Vercel
├── .gitignore              # Configuración de archivos a ignorar
├── setup.sh                # Script para configurar el proyecto
└── README.md               # Documentación del proyecto
```

## 🔍 Características Únicas

- **🧠 Adaptación a Patrones Energéticos**: A diferencia de otros planificadores que solo consideran el tiempo disponible, esta aplicación aprende de tus patrones naturales de energía mental.

- **📊 Correlación Energía-Productividad**: Visualiza la relación entre tus niveles de energía y tu productividad real, ayudándote a entender mejor tus propios patrones.

- **⚡ Sistema de Reserva Energética**: Considera no solo tu energía inmediata sino también la reserva necesaria para mantener un estudio efectivo a lo largo del día.

- **🔌 Modo Offline**: Funciona sin conexión a internet, sincronizando datos cuando vuelves a conectarte.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👩‍💻 Desarrollado por

Creado con 💜 por Elizabeth Diaz Familia
- 🐱 [GitHub](https://github.com/Lizzy0981)
- 💼 [LinkedIn](https://linkedin.com/in/eli-familia/)
- 🐦 [Twitter](https://twitter.com/Lizzyfamilia)
  
## 🙏 Agradecimientos

- 🎓 A todos los estudiantes que buscan optimizar su tiempo de estudio
- 📚 A la comunidad científica por sus investigaciones sobre productividad cognitiva
- 🧪 A los usuarios que prueban esta herramienta y contribuyen a su mejora
- 💖 A quienes comparten sus experiencias para ayudar a otros estudiantes
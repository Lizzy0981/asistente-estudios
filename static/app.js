// Configuración inicial
const API_BASE_URL = window.location.origin + '/api';
let USER_ID = localStorage.getItem('user_id') || generateUserId();
let userData = null;
let chartInstances = {};

// Generar un ID de usuario aleatorio con mayor unicidad
function generateUserId() {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 10);
    const id = 'user_' + timestamp + '_' + random;
    console.log('Generando nuevo ID de usuario:', id);
    localStorage.setItem('user_id', id); // Guardar inmediatamente en localStorage
    return id;
}

// Mostrar mensaje en consola para verificar ID
console.log('ID de usuario actual:', USER_ID);

// Funciones para mostrar notificaciones con animaciones
function showNotification(title, message) {
    const modalContent = document.getElementById('modal-content');
    const modal = document.getElementById('notification-modal');
    
    if (!modalContent || !modal) {
        console.error('Elementos del modal no encontrados');
        alert(`${title}: ${message}`); // Fallback si no existe el modal
        return;
    }
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    
    // Resetear estilos para animación
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'scale(0.8)';
    modal.classList.remove('hidden');
    
    // Animar entrada
    setTimeout(() => {
        modalContent.style.transition = 'all 0.3s ease-out';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
}

// Cerrar la notificación
function closeNotification() {
    const modalContent = document.getElementById('modal-content');
    const modal = document.getElementById('notification-modal');
    
    if (!modalContent || !modal) return;
    
    // Animar la salida del modal
    modalContent.style.transition = 'all 0.3s ease';
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Actualizar recomendaciones
function updateRecommendations(recommendations) {
    if (!recommendations) {
        console.error('Recomendaciones inválidas');
        return;
    }
    
    // Actualizar consejos generales
    const adviceList = document.getElementById('general-advice');
    if (adviceList) {
        adviceList.innerHTML = recommendations.general_advice.map(advice => 
            `<li>${advice}</li>`
        ).join('');
    } else {
        console.error('Elemento no encontrado: general-advice');
    }
    
    // Actualizar horario óptimo
    const schedule = recommendations.optimal_schedule;
    for (const [timeOfDay, tasks] of Object.entries(schedule)) {
        const taskList = document.getElementById(`${timeOfDay}-tasks`);
        if (!taskList) {
            console.error(`Elemento no encontrado: ${timeOfDay}-tasks`);
            continue;
        }
        
        if (tasks.length === 0) {
            taskList.innerHTML = `<li class="italic text-gray-500">Sin tareas asignadas</li>`;
            continue;
        }
        
        taskList.innerHTML = tasks.map(task => 
            `<li>${task.title}</li>`
        ).join('');
    }
    
    // Actualizar patrones de energía si es necesario
    if (recommendations.energy_patterns) {
        updateEnergyIndicators(recommendations.energy_patterns);
    }
}

// Inicializar gráficos
function initCharts() {
    console.log('Inicializando gráficos...');
    
    // Verificar si Chart está disponible
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no está disponible');
        
        // Intentar cargar Chart.js dinámicamente
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js';
        script.onload = () => {
            console.log('Chart.js cargado dinámicamente');
            initChartsAfterLoad();
        };
        script.onerror = () => {
            console.error('No se pudo cargar Chart.js dinámicamente');
            document.querySelectorAll('.h-64').forEach(container => {
                container.innerHTML = `
                    <div class="flex items-center justify-center h-full bg-gray-100 rounded">
                        <p class="text-gray-500 italic">No se pudo cargar el gráfico.</p>
                    </div>
                `;
            });
        };
        document.head.appendChild(script);
        return;
    }
    
    initChartsAfterLoad();
}

// Inicializar gráficos después de que Chart.js esté cargado
function initChartsAfterLoad() {
    // Gráfico de Energía vs Productividad
    const evpCanvas = document.getElementById('energy-productivity-chart');
    if (evpCanvas) {
        const evpCtx = evpCanvas.getContext('2d');
        chartInstances.energyVsProductivity = new Chart(evpCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Sesiones de Estudio',
                    data: generateScatterData(),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Nivel de Energía'
                        },
                        ticks: {
                            min: 0,
                            max: 10
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Productividad'
                        },
                        ticks: {
                            min: 0,
                            max: 10
                        }
                    }]
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            const dataPoint = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            return [
                                `Tema: ${dataPoint.topic || 'Ejemplo'}`,
                                `Energía: ${dataPoint.x}`,
                                `Productividad: ${dataPoint.y}`
                            ];
                        }
                    }
                }
            }
        });
    } else {
        console.error('Elemento no encontrado: energy-productivity-chart');
    }
    
    // Gráfico de Productividad por Momento del Día
    const tpCanvas = document.getElementById('time-productivity-chart');
    if (tpCanvas) {
        const tpCtx = tpCanvas.getContext('2d');
        chartInstances.timeProductivity = new Chart(tpCtx, {
            type: 'bar',
            data: {
                labels: ['Mañana', 'Tarde', 'Noche', 'Madrugada'],
                datasets: [{
                    label: 'Productividad Promedio',
                    data: [7, 6, 5, 3], // Valores de ejemplo
                    backgroundColor: [
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            max: 10
                        }
                    }]
                }
            }
        });
    } else {
        console.error('Elemento no encontrado: time-productivity-chart');
    }
    
    // Actualizar los datos de los gráficos
    updateCharts();
}

// Funciones para el calendario
function initializeCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) {
        console.error('Elemento no encontrado: calendar-grid');
        return;
    }
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Obtener el primer día del mes y el número de días
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Ajustar para empezar el calendario en lunes (0 = lunes, 6 = domingo)
    const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
    
    // Limpiar calendario existente
    calendarGrid.innerHTML = '';
    
    // Agregar celdas vacías para los días anteriores al primer día del mes
    for (let i = 0; i < adjustedFirstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'h-24 bg-gray-50 rounded border border-gray-200 p-1';
        calendarGrid.appendChild(emptyCell);
    }
    
    // Crear una celda para cada día del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = day === now.getDate();
        
        const cell = document.createElement('div');
        cell.className = `h-24 rounded border p-1 transition-all duration-300 transform hover:scale-105 ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
        }`;
        
        // Número del día
        const dayNumber = document.createElement('div');
        dayNumber.className = `text-right font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`;
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);
        
        // Contenedor para tareas
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'mt-1 text-xs space-y-1 overflow-hidden';
        cell.appendChild(tasksContainer);
        
        // Añadir eventos (si hay tareas para este día)
        if (userData && userData.tasks) {
            const tasksForDay = userData.tasks.filter(task => {
                if (!task.deadline) return false;
                const taskDate = new Date(task.deadline);
                return taskDate.getDate() === day && 
                       taskDate.getMonth() === month && 
                       taskDate.getFullYear() === year;
            });
            
            tasksForDay.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `px-1 py-0.5 rounded text-white truncate ${
                    task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                }`;
                taskElement.textContent = task.title;
                tasksContainer.appendChild(taskElement);
            });
        }
        
        // Añadir celda al calendario
        calendarGrid.appendChild(cell);
    }
}

// Generar datos de ejemplo para el gráfico de dispersión
function generateScatterData() {
    if (!userData || !userData.study_sessions || userData.study_sessions.length === 0) {
        console.log('Generando datos de ejemplo para el gráfico de dispersión');
        return Array(5).fill().map(() => ({
            x: Math.floor(Math.random() * 10) + 1,
            y: Math.floor(Math.random() * 10) + 1,
            topic: 'Ejemplo'
        }));
    }
    
    console.log(`Generando datos reales para el gráfico de dispersión (${userData.study_sessions.length} sesiones)`);
    return userData.study_sessions.map(session => ({
        x: session.energy_level,
        y: session.productivity_score,
        topic: session.topic
    }));
}

// Actualizar los datos de los gráficos
function updateCharts() {
    if (!chartInstances.energyVsProductivity || !chartInstances.timeProductivity) {
        console.log('Los gráficos no están inicializados aún');
        return;
    }
    
    console.log('Actualizando gráficos...');
    
    // Actualizar gráfico de dispersión
    chartInstances.energyVsProductivity.data.datasets[0].data = generateScatterData();
    chartInstances.energyVsProductivity.update();
    
    // Calcular productividad por momento del día
    const productivityByTime = {
        morning: { total: 0, count: 0 },
        afternoon: { total: 0, count: 0 },
        evening: { total: 0, count: 0 },
        night: { total: 0, count: 0 }
    };
    
    if (userData && userData.study_sessions) {
        userData.study_sessions.forEach(session => {
            if (!session.timestamp || !session.productivity_score) return;
            
            const hour = new Date(session.timestamp).getHours();
            let timeOfDay;
            
            if (hour >= 5 && hour < 12) timeOfDay = 'morning';
            else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
            else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
            else timeOfDay = 'night';
            
            productivityByTime[timeOfDay].total += session.productivity_score;
            productivityByTime[timeOfDay].count++;
        });
    }
    
    // Calcular promedios
    const averages = [
        productivityByTime.morning.count ? productivityByTime.morning.total / productivityByTime.morning.count : 5, // Valor ejemplo si no hay datos
        productivityByTime.afternoon.count ? productivityByTime.afternoon.total / productivityByTime.afternoon.count : 7,
        productivityByTime.evening.count ? productivityByTime.evening.total / productivityByTime.evening.count : 6,
        productivityByTime.night.count ? productivityByTime.night.total / productivityByTime.night.count : 4
    ];
    
    // Actualizar gráfico de barras
    chartInstances.timeProductivity.data.datasets[0].data = averages;
    chartInstances.timeProductivity.update();
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Guardar perfil
    const saveProfileBtn = document.getElementById('save-profile');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            const name = document.getElementById('user-name').value;
            try {
                await window.saveUserProfile({ name });
                showNotification('Éxito', 'Perfil actualizado correctamente');
            } catch (error) {
                console.error('Error guardando perfil:', error);
                showNotification('Error', 'No se pudo guardar el perfil');
            }
        });
    } else {
        console.error('Elemento no encontrado: save-profile');
    }

    // Regenerar ID de usuario
const regenerateIdBtn = document.getElementById('regenerate-id');
if (regenerateIdBtn) {
    regenerateIdBtn.addEventListener('click', () => {
        USER_ID = generateUserId();
        document.getElementById('user-id').textContent = USER_ID;
    });
} else {
    console.error('Elemento no encontrado: regenerate-id');
}
    
    // Formulario de sesión
    const sessionForm = document.getElementById('session-form');
    if (sessionForm) {
        sessionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const sessionData = {
                topic: document.getElementById('session-topic').value,
                duration_minutes: parseInt(document.getElementById('session-duration').value),
                energy_level: parseInt(document.getElementById('session-energy').value),
                productivity_score: parseInt(document.getElementById('session-productivity').value),
                notes: document.getElementById('session-notes').value
            };
            
            try {
                await window.logStudySession(sessionData);
                document.getElementById('session-form').reset();
                showNotification('Éxito', 'Sesión registrada correctamente');
                
                // Actualizar datos y gráficos
                userData = await window.fetchUserData();
                updateCharts();
                
                // Actualizar recomendaciones
                const recommendations = await window.fetchRecommendations();
                updateRecommendations(recommendations);
            } catch (error) {
                console.error('Error registrando sesión:', error);
                showNotification('Error', 'No se pudo registrar la sesión');
            }
        });
    } else {
        console.error('Elemento no encontrado: session-form');
    }
    
    // Mostrar/ocultar formulario de tarea
    const newTaskBtn = document.getElementById('new-task-btn');
    if (newTaskBtn) {
        newTaskBtn.addEventListener('click', () => {
            const taskForm = document.getElementById('new-task-form');
            if (taskForm) {
                taskForm.classList.toggle('hidden');
            } else {
                console.error('Elemento no encontrado: new-task-form');
            }
        });
    } else {
        console.error('Elemento no encontrado: new-task-btn');
    }
    
    const cancelTaskBtn = document.getElementById('cancel-task');
    if (cancelTaskBtn) {
        cancelTaskBtn.addEventListener('click', () => {
            const taskForm = document.getElementById('task-form');
            if (taskForm) {
                taskForm.reset();
            }
            const newTaskForm = document.getElementById('new-task-form');
            if (newTaskForm) {
                newTaskForm.classList.add('hidden');
            }
        });
    }
    
    // Formulario de tarea
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const taskData = {
                title: document.getElementById('task-title').value,
                description: document.getElementById('task-description').value,
                estimated_energy: parseInt(document.getElementById('task-energy').value),
                deadline: document.getElementById('task-deadline').value || null
            };
            
            try {
                await window.addTask(taskData);
                document.getElementById('task-form').reset();
                document.getElementById('new-task-form').classList.add('hidden');
                showNotification('Éxito', 'Tarea añadida correctamente');
                
                // Actualizar datos y tabla
                userData = await window.fetchUserData();
                updateTasksTable();
                
                // Actualizar calendario
                initializeCalendar();
                
                // Actualizar recomendaciones
                const recommendations = await window.fetchRecommendations();
                updateRecommendations(recommendations);
            } catch (error) {
                console.error('Error añadiendo tarea:', error);
                showNotification('Error', 'No se pudo añadir la tarea');
            }
        });
    } else {
        console.error('Elemento no encontrado: task-form');
    }
    
    // Cerrar modal
    const modalCloseBtn = document.getElementById('modal-close');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeNotification);
    }
    
    // Delegación de eventos para cambiar el estado de las tareas
    const tasksTable = document.getElementById('tasks-table');
    if (tasksTable) {
        tasksTable.addEventListener('click', async (e) => {
            if (e.target.classList.contains('toggle-task-status')) {
                const taskId = parseInt(e.target.dataset.taskId);
                const task = userData.tasks.find(t => t.id === taskId);
                
                if (!task) return;
                
                const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                
                try {
                    await window.updateTaskStatus(taskId, newStatus);
                    showNotification('Éxito', 'Estado de la tarea actualizado');
                    
                    // Actualizar datos y tabla
                    userData = await window.fetchUserData();
                    updateTasksTable();
                    
                    // Actualizar calendario
                    initializeCalendar();
                    
                    // Actualizar recomendaciones
                    const recommendations = await window.fetchRecommendations();
                    updateRecommendations(recommendations);
                } catch (error) {
                    console.error('Error actualizando tarea:', error);
                    showNotification('Error', 'No se pudo actualizar la tarea');
                }
            }
        });
    } else {
        console.error('Elemento no encontrado: tasks-table');
    }
}

// Funciones para interactuar con la API
async function fetchUserData() {
    console.log(`Obteniendo datos para el usuario: ${USER_ID}`);
    try {
        const response = await fetch(`${API_BASE_URL}/user/${USER_ID}`);
        if (!response.ok) throw new Error('Error cargando datos');
        return await response.json();
    } catch (error) {
        console.error('Error en fetchUserData:', error);
        throw error;
    }
}

async function saveUserProfile(data) {
    try {
        // Generar un nuevo ID al actualizar el nombre
        USER_ID = generateUserId();
        
        const response = await fetch(`${API_BASE_URL}/user/${USER_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error guardando perfil');
        return await response.json();
    } catch (error) {
        console.error('Error en saveUserProfile:', error);
        throw error;
    }
}

async function logStudySession(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${USER_ID}/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error registrando sesión');
        return await response.json();
    } catch (error) {
        console.error('Error en logStudySession:', error);
        throw error;
    }
}

async function addTask(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${USER_ID}/task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error añadiendo tarea');
        return await response.json();
    } catch (error) {
        console.error('Error en addTask:', error);
        throw error;
    }
}

async function updateTaskStatus(taskId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${USER_ID}/task/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) throw new Error('Error actualizando tarea');
        return await response.json();
    } catch (error) {
        console.error('Error en updateTaskStatus:', error);
        throw error;
    }
}

async function fetchRecommendations() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${USER_ID}/recommendations`);
        if (!response.ok) throw new Error('Error cargando recomendaciones');
        return await response.json();
    } catch (error) {
        console.error('Error en fetchRecommendations:', error);
        throw error;
    }
}

// Modo offline para desarrollo
function enableOfflineMode() {
    console.log('Activando modo offline...');
    
    // Datos de ejemplo para modo offline
    userData = {
        user_id: USER_ID,
        name: "Usuario de prueba",
        energy_patterns: {
            morning: 0.7,
            afternoon: 0.6,
            evening: 0.5,
            night: 0.3
        },
        study_sessions: [
            {
                timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
                duration_minutes: 60,
                topic: "Matemáticas",
                energy_level: 8,
                productivity_score: 7,
                notes: "Ejemplo de sesión de estudio"
            },
            {
                timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
                duration_minutes: 90,
                topic: "Historia",
                energy_level: 6,
                productivity_score: 8,
                notes: "Ejemplo de sesión de estudio"
            }
        ],
        tasks: [
            {
                id: 1,
                title: "Proyecto final",
                description: "Completar el proyecto final de programación",
                estimated_energy: 8,
                deadline: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
                status: "pending",
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: "Ejercicios de matemáticas",
                description: "Completar ejercicios del capítulo 5",
                estimated_energy: 6,
                deadline: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
                status: "pending",
                created_at: new Date().toISOString()
            }
        ]
    };
    
    return {
        fetchUserData: async () => userData,
        saveUserProfile: async (data) => {
            userData.name = data.name;
            return { status: 'success' };
        },
        logStudySession: async (data) => {
            const session = {
                timestamp: new Date().toISOString(),
                duration_minutes: data.duration_minutes,
                topic: data.topic,
                energy_level: data.energy_level,
                productivity_score: data.productivity_score,
                notes: data.notes
            };
            
            userData.study_sessions.push(session);
            return { status: 'success', session };
        },
        addTask: async (data) => {
            const task = {
                id: userData.tasks.length + 1,
                title: data.title,
                description: data.description,
                estimated_energy: data.estimated_energy,
                deadline: data.deadline,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            
            userData.tasks.push(task);
            return { status: 'success', task };
        },
        updateTaskStatus: async (taskId, status) => {
            const task = userData.tasks.find(t => t.id === taskId);
            if (task) task.status = status;
            return { status: 'success' };
        },
        fetchRecommendations: async () => {
            // Calcular horario óptimo basado en patrones de energía
            const highEnergyTime = Object.entries(userData.energy_patterns)
                .sort((a, b) => b[1] - a[1])[0][0];
            
            const lowEnergyTime = Object.entries(userData.energy_patterns)
                .sort((a, b) => a[1] - b[1])[0][0];
            
            // Distribuir tareas según necesidad de energía
            const pendingTasks = userData.tasks.filter(t => t.status === 'pending');
            const schedule = {
                morning: [],
                afternoon: [],
                evening: [],
                night: []
            };
            
            // Asignar tareas a momentos del día según nivel de energía
            pendingTasks.forEach(task => {
                const normalizedEnergy = task.estimated_energy / 10;
                
                // Encontrar el mejor momento para esta tarea
                let bestTime = Object.entries(userData.energy_patterns)
                    .filter(([_, value]) => value >= normalizedEnergy)
                    .sort((a, b) => b[1] - a[1])[0];
                
                if (!bestTime) {
                    bestTime = [highEnergyTime, userData.energy_patterns[highEnergyTime]];
                }
                
                schedule[bestTime[0]].push({
                    task_id: task.id,
                    title: task.title
                });
            });
            
            return {
                energy_patterns: userData.energy_patterns,
                optimal_schedule: schedule,
                general_advice: [
                    `Tu mejor momento para tareas difíciles es ${highEnergyTime === 'morning' ? 'la mañana' : highEnergyTime === 'afternoon' ? 'la tarde' : highEnergyTime === 'evening' ? 'la noche' : 'la madrugada'}`,
                    `Evita programar tareas importantes durante ${lowEnergyTime === 'morning' ? 'la mañana' : lowEnergyTime === 'afternoon' ? 'la tarde' : lowEnergyTime === 'evening' ? 'la noche' : 'la madrugada'}`,
                    "Considera tomar descansos de 5 minutos cada 25 minutos de estudio",
                    "Hidratarte regularmente mejora tu concentración",
                    "Alterna entre diferentes temas para mantener la mente fresca"
                ]
            };
        }
    };
}

// Actualizar la interfaz con los datos del usuario
function updateUIWithUserData() {
    console.log('Actualizando UI con datos de usuario...');
    
    // Actualizar nombre
    const userNameInput = document.getElementById('user-name');
    if (userNameInput) {
        userNameInput.value = userData.name || '';
    } else {
        console.error('Elemento no encontrado: user-name');
    }
    
    // Actualizar indicadores de energía
    updateEnergyIndicators(userData.energy_patterns);
    
    // Actualizar tabla de tareas
    updateTasksTable();
}

// Actualizar los indicadores de energía
function updateEnergyIndicators(energyPatterns) {
    console.log('Actualizando indicadores de energía:', energyPatterns);
    
    for (const [time, value] of Object.entries(energyPatterns)) {
        const percent = Math.round(value * 100);
        const valueElement = document.getElementById(`${time}-value`);
        const indicatorElement = document.getElementById(`${time}-indicator`);
        
        if (valueElement) {
            valueElement.textContent = `${percent}%`;
        } else {
            console.error(`Elemento no encontrado: ${time}-value`);
        }
        
        if (indicatorElement) {
            indicatorElement.style.left = `${percent}%`;
        } else {
            console.error(`Elemento no encontrado: ${time}-indicator`);
        }
    }
}

// Actualizar la tabla de tareas (CORREGIDO)
function updateTasksTable() {
    console.log('Actualizando tabla de tareas...');
    
    const tasksTable = document.getElementById('tasks-table');
    if (!tasksTable) {
        console.error('Elemento no encontrado: tasks-table');
        return;
    }
    
    // Verificar si hay tareas
    if (!userData || !userData.tasks || userData.tasks.length === 0) {
        console.log('No hay tareas para mostrar');
        tasksTable.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500 italic">No hay tareas registradas</td>
            </tr>
        `;
        return;
    }
    
    console.log(`Mostrando ${userData.tasks.length} tareas`);
    
    // Ordenar tareas: primero pendientes, luego por fecha límite
    const sortedTasks = [...userData.tasks].sort((a, b) => {
        // Primero por estado
        if (a.status !== b.status) {
            return a.status === 'pending' ? -1 : 1;
        }
        // Luego por fecha límite
        if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
        }
        // Las tareas sin fecha van al final
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return 0;
    });
    
    // Generar HTML para cada tarea
    const tasksHTML = sortedTasks.map(task => {
        const deadlineDate = task.deadline ? new Date(task.deadline) : null;
        const formattedDeadline = deadlineDate ? deadlineDate.toLocaleDateString() : 'Sin fecha';
        const statusClass = task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        const statusText = task.status === 'completed' ? 'Completada' : 'Pendiente';
        
        return `
            <tr>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${task.title}</div>
                    <div class="text-xs text-gray-500">${task.description || ''}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${task.estimated_energy * 10}%"></div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${formattedDeadline}</td>
                <td class="px-6 py-4">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm">
                    <button class="text-indigo-600 hover:text-indigo-900 toggle-task-status" data-task-id="${task.id}">
                        ${task.status === 'completed' ? 'Marcar pendiente' : 'Completar'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Actualizar la tabla
    tasksTable.innerHTML = tasksHTML;
}

// Inicializar la aplicación
async function initApp() {
    console.log('Inicializando aplicación...');
    
    // Inicializar ID de usuario en la UI
    const userIdElement = document.getElementById('user-id');
    if (userIdElement) {
        userIdElement.textContent = USER_ID;
        console.log('ID de usuario mostrado en la interfaz:', USER_ID);
    } else {
        console.error('Elemento no encontrado: user-id');
    }
    
    // Comprobar si estamos en modo offline (desarrollo local)
    const isOfflineMode = !API_BASE_URL.includes('https://');
    
    if (isOfflineMode) {
        console.log('Ejecutando en modo offline');
        const offlineAPI = enableOfflineMode();
        
        // Reemplazar funciones de API con versiones offline
        window.fetchUserData = offlineAPI.fetchUserData;
        window.saveUserProfile = offlineAPI.saveUserProfile;
        window.logStudySession = offlineAPI.logStudySession;
        window.addTask = offlineAPI.addTask;
        window.updateTaskStatus = offlineAPI.updateTaskStatus;
        window.fetchRecommendations = offlineAPI.fetchRecommendations;
    } else {
        // Usar funciones normales de API
        window.fetchUserData = fetchUserData;
        window.saveUserProfile = saveUserProfile;
        window.logStudySession = logStudySession;
        window.addTask = addTask;
        window.updateTaskStatus = updateTaskStatus;
        window.fetchRecommendations = fetchRecommendations;
    }
    
    try {
        // Cargar datos del usuario
        userData = await window.fetchUserData();
        console.log('Datos de usuario cargados:', userData);
        updateUIWithUserData();
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        showNotification('Error', 'No se pudieron cargar los datos. Usando modo offline.');
        
        // Activar modo offline como fallback
        const offlineAPI = enableOfflineMode();
        window.fetchUserData = offlineAPI.fetchUserData;
        window.saveUserProfile = offlineAPI.saveUserProfile;
        window.logStudySession = offlineAPI.logStudySession;
        window.addTask = offlineAPI.addTask;
        window.updateTaskStatus = offlineAPI.updateTaskStatus;
        window.fetchRecommendations = offlineAPI.fetchRecommendations;
        
        // Cargar datos offline
        userData = await window.fetchUserData();
        updateUIWithUserData();
    }
    
    try {
        // Cargar recomendaciones
        const recommendations = await window.fetchRecommendations();
        console.log('Recomendaciones cargadas:', recommendations);
        updateRecommendations(recommendations);
    } catch (error) {
        console.error('Error cargando recomendaciones:', error);
    }
    
    // Inicializar gráficos
    initCharts();
    
    // Inicializar calendario
    initializeCalendar();
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('Aplicación inicializada con éxito');
}

// Añadir animaciones a la interfaz
function addEntryAnimations() {
    // Animar las tarjetas principales con un efecto de cascada
    const cards = document.querySelectorAll('.rounded-lg');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
    
    // Animar los indicadores de energía
    const indicators = document.querySelectorAll('.energy-indicator');
    indicators.forEach((indicator, index) => {
        indicator.style.opacity = '0';
        
        setTimeout(() => {
            indicator.style.transition = 'opacity 0.5s ease, left 1s ease';
            indicator.style.opacity = '1';
        }, 500 + (100 * index));
    });
}

// Iniciar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando aplicación...');
    initApp().catch(error => {
        console.error('Error al inicializar la aplicación:', error);
        showNotification('Error', 'Hubo un problema al inicializar la aplicación. Por favor, recarga la página.');
    });
});
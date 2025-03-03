from flask import Flask, request, jsonify
from flask import send_file
from flask import send_from_directory
from datetime import datetime, timedelta
import numpy as np
import json
import os
import random

app = Flask(__name__)

# Simulación de base de datos con archivos JSON
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

# Agregar esta función para servir archivos estáticos
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

def get_user_data(user_id):
    """Obtiene los datos del usuario o crea un nuevo perfil"""
    user_file = os.path.join(DATA_DIR, f"user_{user_id}.json")
    
    if os.path.exists(user_file):
        with open(user_file, 'r') as f:
            return json.load(f)
    else:
        # Crear un nuevo perfil de usuario
        new_user = {
            "user_id": user_id,
            "name": "",
            "energy_patterns": {
                "morning": random.uniform(0.6, 1.0),
                "afternoon": random.uniform(0.4, 0.9),
                "evening": random.uniform(0.3, 0.8),
                "night": random.uniform(0.2, 0.7)
            },
            "study_sessions": [],
            "tasks": []
        }
        
        save_user_data(user_id, new_user)
        return new_user

def save_user_data(user_id, data):
    """Guarda los datos del usuario"""
    user_file = os.path.join(DATA_DIR, f"user_{user_id}.json")
    with open(user_file, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/api/user/<user_id>', methods=['GET', 'POST'])
def user_profile(user_id):
    if request.method == 'GET':
        return jsonify(get_user_data(user_id))
    
    elif request.method == 'POST':
        data = request.json
        user_data = get_user_data(user_id)
        
        # Actualizar solo los campos proporcionados
        for key in data:
            if key in user_data and key != "user_id":
                user_data[key] = data[key]
        
        save_user_data(user_id, user_data)
        return jsonify({"status": "success", "message": "Profile updated"})

@app.route('/api/user/<user_id>/session', methods=['POST'])
def log_session(user_id):
    """Registra una nueva sesión de estudio"""
    data = request.json
    user_data = get_user_data(user_id)
    
    session = {
        "timestamp": datetime.now().isoformat(),
        "duration_minutes": data.get("duration_minutes", 0),
        "topic": data.get("topic", ""),
        "energy_level": data.get("energy_level", 5),
        "productivity_score": data.get("productivity_score", 5),
        "notes": data.get("notes", "")
    }
    
    user_data["study_sessions"].append(session)
    save_user_data(user_id, user_data)
    
    return jsonify({
        "status": "success", 
        "message": "Session logged",
        "session": session
    })

@app.route('/api/user/<user_id>/task', methods=['POST'])
def add_task(user_id):
    """Añade una nueva tarea pendiente"""
    data = request.json
    user_data = get_user_data(user_id)
    
    task = {
        "id": len(user_data["tasks"]) + 1,
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "estimated_energy": data.get("estimated_energy", 5),
        "deadline": data.get("deadline", ""),
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    
    user_data["tasks"].append(task)
    save_user_data(user_id, user_data)
    
    return jsonify({
        "status": "success", 
        "message": "Task added",
        "task": task
    })

@app.route('/api/user/<user_id>/task/<int:task_id>', methods=['PUT'])
def update_task(user_id, task_id):
    """Actualiza el estado de una tarea"""
    data = request.json
    user_data = get_user_data(user_id)
    
    for task in user_data["tasks"]:
        if task["id"] == task_id:
            for key in data:
                if key in task:
                    task[key] = data[key]
            
            save_user_data(user_id, user_data)
            return jsonify({
                "status": "success", 
                "message": "Task updated",
                "task": task
            })
    
    return jsonify({
        "status": "error", 
        "message": "Task not found"
    }), 404

@app.route('/api/user/<user_id>/recommendations', methods=['GET'])
def get_recommendations(user_id):
    """Genera recomendaciones personalizadas basadas en el patrón de energía"""
    user_data = get_user_data(user_id)
    energy_patterns = user_data["energy_patterns"]
    
    # Analizar sesiones anteriores para ajustar patrones
    if len(user_data["study_sessions"]) > 0:
        sessions = user_data["study_sessions"]
        for session in sessions:
            # Extraer el momento del día
            if "timestamp" in session:
                session_time = datetime.fromisoformat(session["timestamp"]).hour
                time_of_day = ""
                
                if 5 <= session_time < 12:
                    time_of_day = "morning"
                elif 12 <= session_time < 17:
                    time_of_day = "afternoon"
                elif 17 <= session_time < 22:
                    time_of_day = "evening"
                else:
                    time_of_day = "night"
                
                # Ajustar patrón de energía (promedio ponderado)
                if time_of_day in energy_patterns and "energy_level" in session:
                    energy_level = session["energy_level"] / 10  # Normalizar a escala 0-1
                    energy_patterns[time_of_day] = energy_patterns[time_of_day] * 0.7 + energy_level * 0.3
    
    # Actualizar patrones de energía
    user_data["energy_patterns"] = energy_patterns
    save_user_data(user_id, user_data)
    
    # Ordenar tareas por deadline y prioridad
    tasks = user_data["tasks"]
    pending_tasks = [t for t in tasks if t["status"] == "pending"]
    
    # Determinar mejor momento para cada tarea
    task_recommendations = []
    for task in pending_tasks:
        # Encontrar el mejor momento del día según requerimiento de energía
        energy_needed = task.get("estimated_energy", 5) / 10
        best_time = max(energy_patterns.items(), key=lambda x: x[1] if x[1] >= energy_needed else 0)
        
        task_recommendations.append({
            "task_id": task["id"],
            "title": task["title"],
            "recommended_time": best_time[0],
            "energy_match": min(best_time[1] / energy_needed if energy_needed > 0 else 1, 1) * 100
        })
    
    # Generar el horario óptimo
    optimal_schedule = {
        "morning": [],
        "afternoon": [],
        "evening": [],
        "night": []
    }
    
    # Asignar tareas a los mejores momentos
    for task in sorted(task_recommendations, key=lambda x: x["energy_match"], reverse=True):
        optimal_schedule[task["recommended_time"]].append({
            "task_id": task["task_id"],
            "title": task["title"]
        })
    
    recommendations = {
        "energy_patterns": energy_patterns,
        "task_recommendations": task_recommendations,
        "optimal_schedule": optimal_schedule,
        "general_advice": [
            "Tu mejor momento para tareas difíciles es " + max(energy_patterns.items(), key=lambda x: x[1])[0],
            "Evita programar tareas importantes durante tu " + min(energy_patterns.items(), key=lambda x: x[1])[0],
            "Considera tomar descansos de 5 minutos cada 25 minutos de estudio",
            "Hidratarte regularmente mejora tu concentración"
        ]
    }
    
    return jsonify(recommendations)

@app.route('/')
def index():
    return send_file('index.html')


if __name__ == '__main__':
    app.run(debug=True)
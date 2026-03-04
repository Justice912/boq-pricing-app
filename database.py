import sqlite3
import json
from datetime import datetime

DB_NAME = "boq_projects.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            currency TEXT,
            data TEXT,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_project(name, currency, data):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute(
        "INSERT INTO projects (name, currency, data, created_at) VALUES (?, ?, ?, ?)",
        (name, currency, json.dumps(data), datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def load_projects():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, name, created_at FROM projects ORDER BY id DESC")
    rows = c.fetchall()
    conn.close()
    return rows

def load_project(project_id):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT name, currency, data FROM projects WHERE id=?", (project_id,))
    row = c.fetchone()
    conn.close()
    return row
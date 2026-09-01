import aiosqlite
import json
from typing import List, Dict, Any
from core.models import Alert

DB_PATH = "vectorguard.db"

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id TEXT,
                chunk_id TEXT,
                threat_types TEXT,
                confidence REAL,
                source TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        await db.commit()

async def log_alert(alert: Alert) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            INSERT INTO alerts (file_id, chunk_id, threat_types, confidence, source)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            alert.file_id, 
            alert.chunk_id, 
            json.dumps(alert.threat_types), 
            alert.confidence, 
            alert.source
        ))
        await db.commit()

async def get_alerts(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            'SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ? OFFSET ?',
            (limit, offset)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

async def get_stats() -> Dict[str, Any]:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute('SELECT threat_types FROM alerts')
        rows = await cursor.fetchall()
        
        counts = {}
        for row in rows:
            types = json.loads(row[0])
            for t in types:
                counts[t] = counts.get(t, 0) + 1
                
        return counts


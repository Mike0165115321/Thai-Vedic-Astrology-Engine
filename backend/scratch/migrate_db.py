import sqlite3
import os

db_path = "backend/data/astrology.db"

if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # เพิ่มคอลัมน์ ayanamsa_mode
        try:
            cursor.execute("ALTER TABLE saved_charts ADD COLUMN ayanamsa_mode TEXT DEFAULT 'LAHIRI'")
            print("Added ayanamsa_mode column.")
        except sqlite3.OperationalError:
            print("ayanamsa_mode column already exists.")

        # เพิ่มคอลัมน์ custom_ayanamsa_offset
        try:
            cursor.execute("ALTER TABLE saved_charts ADD COLUMN custom_ayanamsa_offset FLOAT DEFAULT 0.0")
            print("Added custom_ayanamsa_offset column.")
        except sqlite3.OperationalError:
            print("custom_ayanamsa_offset column already exists.")
            
        conn.commit()
        conn.close()
        print("Migration successful.")
    except Exception as e:
        print(f"Error during migration: {e}")
else:
    print("Database file not found, nothing to migrate.")

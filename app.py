from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('parking.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS parking_spots (
            id INTEGER PRIMARY KEY,
            status TEXT
        )
    ''')
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/status", methods=["GET"])
def get_status():
    conn = sqlite3.connect('parking.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM parking_spots")
    spots = cursor.fetchall()
    conn.close()
    return jsonify(spots)

@app.route("/status", methods=["POST"])
def update_status():
    spot_id = request.json["id"]
    status = request.json["status"]
    conn = sqlite3.connect('parking.db')
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO parking_spots (id, status) VALUES (?, ?)", (spot_id, status))
    conn.commit()
    conn.close()
    return "Status updated", 200

if __name__ == "__main__":
    init_db()
    app.run(debug=True)

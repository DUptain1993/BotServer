#!/usr/bin/env python3
"""
Health check endpoint for Telegram bot containers
Provides monitoring and health status for the bot platform
"""

import os
import time
import threading
from datetime import datetime
from flask import Flask, jsonify, request
import psutil
import requests

app = Flask(__name__)

# Global variables to track bot health
bot_health = {
    "status": "healthy",
    "start_time": datetime.now().isoformat(),
    "last_activity": datetime.now().isoformat(),
    "message_count": 0,
    "error_count": 0,
    "uptime_seconds": 0,
    "memory_usage_mb": 0,
    "cpu_usage_percent": 0
}

def update_health_metrics():
    """Update health metrics every 30 seconds"""
    while True:
        try:
            # Get system metrics
            process = psutil.Process()
            bot_health["memory_usage_mb"] = process.memory_info().rss / 1024 / 1024
            bot_health["cpu_usage_percent"] = process.cpu_percent()
            bot_health["uptime_seconds"] = int(time.time() - time.mktime(datetime.fromisoformat(bot_health["start_time"].replace('Z', '+00:00')).timetuple()))
            
            # Check if bot is still responsive
            bot_health["status"] = "healthy" if bot_health["error_count"] < 10 else "degraded"
            
        except Exception as e:
            bot_health["error_count"] += 1
            bot_health["status"] = "unhealthy"
            print(f"Health check error: {e}")
        
        time.sleep(30)

@app.route('/health', methods=['GET'])
def health_check():
    """Main health check endpoint"""
    return jsonify({
        "status": bot_health["status"],
        "timestamp": datetime.now().isoformat(),
        "uptime_seconds": bot_health["uptime_seconds"],
        "memory_usage_mb": round(bot_health["memory_usage_mb"], 2),
        "cpu_usage_percent": round(bot_health["cpu_usage_percent"], 2),
        "message_count": bot_health["message_count"],
        "error_count": bot_health["error_count"]
    })

@app.route('/metrics', methods=['GET'])
def metrics():
    """Prometheus-style metrics endpoint"""
    metrics_data = f"""# HELP bot_messages_total Total messages processed
# TYPE bot_messages_total counter
bot_messages_total {bot_health["message_count"]}

# HELP bot_errors_total Total errors encountered
# TYPE bot_errors_total counter
bot_errors_total {bot_health["error_count"]}

# HELP bot_uptime_seconds Bot uptime in seconds
# TYPE bot_uptime_seconds gauge
bot_uptime_seconds {bot_health["uptime_seconds"]}

# HELP bot_memory_usage_mb Memory usage in MB
# TYPE bot_memory_usage_mb gauge
bot_memory_usage_mb {bot_health["memory_usage_mb"]}

# HELP bot_cpu_usage_percent CPU usage percentage
# TYPE bot_cpu_usage_percent gauge
bot_cpu_usage_percent {bot_health["cpu_usage_percent"]}

# HELP bot_status Bot health status (1=healthy, 0=unhealthy)
# TYPE bot_status gauge
bot_status {1 if bot_health["status"] == "healthy" else 0}
"""
    return metrics_data, 200, {'Content-Type': 'text/plain'}

@app.route('/activity', methods=['POST'])
def record_activity():
    """Record bot activity"""
    data = request.get_json() or {}
    
    if data.get("type") == "message":
        bot_health["message_count"] += 1
    elif data.get("type") == "error":
        bot_health["error_count"] += 1
    
    bot_health["last_activity"] = datetime.now().isoformat()
    
    return jsonify({"status": "recorded"})

@app.route('/status', methods=['GET'])
def status():
    """Detailed status endpoint"""
    return jsonify(bot_health)

if __name__ == '__main__':
    # Start health metrics thread
    health_thread = threading.Thread(target=update_health_metrics, daemon=True)
    health_thread.start()
    
    # Run Flask app
    app.run(host='0.0.0.0', port=8080, debug=False)

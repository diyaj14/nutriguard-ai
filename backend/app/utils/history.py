import json
import os
from datetime import datetime
from typing import List, Dict, Any

HISTORY_FILE = os.path.join(os.path.dirname(__file__), '..', '..', 'scan_history.json')

def save_scan(user_profile: Dict[str, Any], product_data: Dict[str, Any], score: float):
    """Saves a scan result to the history file."""
    history = []
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
        except:
            history = []
    
    new_entry = {
        'timestamp': datetime.now().isoformat(),
        'product_name': product_data.get('name', 'Unknown'),
        'product_id': product_data.get('product_id', 'Unknown'),
        'score': score,
        'calories': product_data.get('nutrition', {}).get('energy_kcal_100g', 0),
        'user_profile_summary': {
            'has_diabetes': user_profile.get('has_diabetes', False),
            'has_hypertension': user_profile.get('has_hypertension', False)
        }
    }
    
    history.append(new_entry)
    
    # Keep only last 50 scans for the demo
    history = history[-50:]
    
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

def get_history() -> List[Dict[str, Any]]:
    """Retrieves the scan history."""
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

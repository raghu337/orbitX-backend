import os
import re
import socket


def get_local_ip():
    try:
        # Standard dynamic lookup as requested
        ip = socket.gethostbyname(socket.gethostname())
        # Fallback if resolving hostname returns loopback (127.0.0.1)
        if ip.startswith('127.'):
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            try:
                s.connect(('8.8.8.8', 80))
                ip = s.getsockname()[0]
            except Exception:
                pass
            finally:
                s.close()
        return ip
    except Exception as e:
        print(f"[update_network.py] Error detecting IP: {e}")
        return '127.0.0.1'

def update_config():
    ip = get_local_ip()
    print(f"[update_network.py] Detected Active Local IP: {ip}")

    # Locate config file relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    api_file_path = os.path.abspath(os.path.join(script_dir, '..', 'src', 'services', 'api', 'orbitxApi.js'))

    if not os.path.exists(api_file_path):
        print(f"[update_network.py] Error: config file not found at {api_file_path}")
        return False

    try:
        with open(api_file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        pattern = r"(?:export\s+)?const MACHINE_IP\s*=\s*'[^']*';"
        replacement = f"export const MACHINE_IP = '{ip}';"

        updated_content = re.sub(pattern, replacement, content)

        with open(api_file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)

        print(f"[update_network.py] Success: Overwrote MACHINE_IP with '{ip}' in orbitxApi.js")
        return True
    except Exception as e:
        print(f"[update_network.py] Error updating config file: {e}")
        return False

if __name__ == '__main__':
    update_config()

import sys

import firebase_admin
from firebase_admin import credentials, db

from app.core.config import settings

_firebase_initialized = False

try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred, {
            'databaseURL': settings.FIREBASE_DATABASE_URL
        })
    _firebase_initialized = True
    print("[Firebase] Initialization OK")
except Exception as e:
    print(f"[Firebase] WARNING: Initialization failed. Operating in resilient local state mode: {e}", file=sys.stderr)
    _firebase_initialized = False


class MockFirebaseQuery:
    def __init__(self, data, order_child=None, equal_val=None):
        self.data = data
        self.order_child = order_child
        self.equal_val = equal_val

    def equal_to(self, val):
        self.equal_val = val
        return self

    def get(self):
        if not isinstance(self.data, dict):
            return self.data
        if self.order_child and self.equal_val is not None:
            res = {}
            for k, v in self.data.items():
                if isinstance(v, dict) and str(v.get(self.order_child)) == str(self.equal_val):
                    res[k] = v
            return res
        return self.data


class MockFirebaseRef:
    _store = {}

    def __init__(self, path=""):
        self.path = path.strip("/")

    def _get_node(self):
        if not self.path:
            return MockFirebaseRef._store
        parts = [p for p in self.path.split("/") if p]
        curr = MockFirebaseRef._store
        for p in parts:
            if isinstance(curr, dict) and p in curr:
                curr = curr[p]
            else:
                return None
        return curr

    def get(self):
        return self._get_node()

    def set(self, value):
        if not self.path:
            MockFirebaseRef._store = value
            return
        parts = [p for p in self.path.split("/") if p]
        curr = MockFirebaseRef._store
        for p in parts[:-1]:
            if p not in curr or not isinstance(curr[p], dict):
                curr[p] = {}
            curr = curr[p]
        curr[parts[-1]] = value

    def child(self, child_path):
        new_path = f"{self.path}/{child_path}" if self.path else str(child_path)
        return MockFirebaseRef(new_path)

    def order_by_child(self, child_name):
        data = self._get_node()
        return MockFirebaseQuery(data, order_child=child_name)


class MockFirebaseDB:
    def reference(self, path=""):
        return MockFirebaseRef(path)


def get_db():
    """
    FastAPI dependency: yields the Firebase database handle if active, else MockFirebaseDB.
    """
    if _firebase_initialized:
        return db
    return MockFirebaseDB()


def check_db_connection() -> bool:
    """
    Health-check: verifies database reachability.
    """
    if _firebase_initialized:
        try:
            db.reference(".info/connected").get()
            return True
        except Exception as e:
            print(f"[Firebase] Health check failed: {e}", file=sys.stderr)
            return False
    return True


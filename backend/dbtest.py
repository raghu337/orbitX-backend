import psycopg2
import sys

# Correct PostgreSQL connection
url = "postgresql://postgres:8897@localhost:5432/orbitx"

print(f"Testing connection to: {url}")

try:
    conn = psycopg2.connect(url, connect_timeout=5)

    cursor = conn.cursor()

    cursor.execute("SELECT version();")
    version = cursor.fetchone()

    print(f"PostgreSQL OK: {version[0][:60]}")

    cursor.execute("""
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_name='users'
        AND table_schema='public'
    """)

    count = cursor.fetchone()[0]

    print(f"Users table exists: {count > 0}")

    if count > 0:

        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]

        print(f"Users in database: {user_count}")

        if user_count > 0:

            cursor.execute("SELECT id, name, email FROM users LIMIT 3")

            rows = cursor.fetchall()

            for r in rows:
                print(f"User: id={r[0]} name={r[1]} email={r[2]}")

    conn.close()

    print("Connection test PASSED")

except Exception as e:

    print(f"Connection FAILED: {type(e).__name__}: {e}")

    sys.exit(1)
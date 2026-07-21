import psycopg2
from psycopg2 import sql


def init_db():
    print("[PostgreSQL] Connecting to default postgres database...")
    try:
        # Connect to default database to create the new one
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="postgres",
            host="localhost",
            port="5432"
        )
        # We need to run CREATE DATABASE outside a transaction
        conn.autocommit = True
        cursor = conn.cursor()

        db_name = "orbitx"

        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (db_name,))
        exists = cursor.fetchone()

        if not exists:
            print(f"[PostgreSQL] Database '{db_name}' does not exist. Creating...")
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(db_name)))
            print(f"[PostgreSQL] ✓ Database '{db_name}' created successfully!")
        else:
            print(f"[PostgreSQL] ✓ Database '{db_name}' already exists.")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"[PostgreSQL] ✗ Error initializing database: {e}")
        exit(1)

if __name__ == "__main__":
    init_db()

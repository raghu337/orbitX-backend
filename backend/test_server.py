from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Server Working"}

@app.get("/test")
def test():
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

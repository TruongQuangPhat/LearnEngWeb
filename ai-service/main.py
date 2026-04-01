import uvicorn
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from app.api.routes import speaking, health, grammar

app = FastAPI(
    title="LearEng AI Service",
    description="Backend FastAPI microservice for AI features",
    version="1.0.0"
)

app.include_router(health.router, prefix="/api")
app.include_router(speaking.router, prefix="/api")
app.include_router(grammar.router, prefix="/api")

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

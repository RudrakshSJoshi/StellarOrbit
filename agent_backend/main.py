from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
import asyncio
from utils import query_handler
import uvicorn


app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],   # Allow all HTTP methods
    allow_headers=["*"],   # Allow all headers
)

# Request body model
class AIRequest(BaseModel):
    request_type: Literal["copilot", "generation", "debugging", "assistance"]
    user_code: str  # Code with rust tags present
    context: str    # Additional context (user prompt or compilation error)

@app.post("/ai")
async def async_endpoint(request: AIRequest):
    result = await query_handler(request.request_type, request.user_code, request.context)
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

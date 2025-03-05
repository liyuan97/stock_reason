import os
import uvicorn
from dotenv import load_dotenv

# Load .env file
load_dotenv()

if __name__ == "__main__":
    # Start development server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
        log_level="info"
    ) 
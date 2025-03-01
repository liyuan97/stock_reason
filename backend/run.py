import os
import uvicorn
from dotenv import load_dotenv

# 加载.env文件
load_dotenv()

if __name__ == "__main__":
    # 启动开发服务器
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 
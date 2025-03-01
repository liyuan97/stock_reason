import os
import sys
from dotenv import load_dotenv
import argparse
import subprocess

# 加载环境变量
load_dotenv()

def main():
    parser = argparse.ArgumentParser(description="数据库迁移工具")
    parser.add_argument("action", choices=["init", "migrate", "upgrade"], help="迁移操作")
    parser.add_argument("--message", "-m", help="迁移消息")
    args = parser.parse_args()
    
    if args.action == "init":
        # 初始化迁移
        subprocess.run(["alembic", "init", "alembic"])
    elif args.action == "migrate":
        # 生成迁移脚本
        if not args.message:
            print("错误: 需要提供迁移消息。使用 -m 'message' 参数")
            sys.exit(1)
        subprocess.run(["alembic", "revision", "--autogenerate", "-m", args.message])
    elif args.action == "upgrade":
        # 应用迁移
        subprocess.run(["alembic", "upgrade", "head"])
    
if __name__ == "__main__":
    main() 
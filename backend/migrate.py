import os
import sys
from dotenv import load_dotenv
import argparse
import subprocess

# Load environment variables
load_dotenv()

def main():
    parser = argparse.ArgumentParser(description="Database Migration Tool")
    parser.add_argument("action", choices=["init", "migrate", "upgrade"], help="Migration operation")
    parser.add_argument("--message", "-m", help="Migration message")
    args = parser.parse_args()
    
    if args.action == "init":
        # Initialize migration
        subprocess.run(["alembic", "init", "alembic"])
    elif args.action == "migrate":
        # Generate migration script
        if not args.message:
            print("Error: Migration message is required. Use -m 'message' parameter")
            sys.exit(1)
        subprocess.run(["alembic", "revision", "--autogenerate", "-m", args.message])
    elif args.action == "upgrade":
        # Apply migrations
        subprocess.run(["alembic", "upgrade", "head"])
    
if __name__ == "__main__":
    main() 
from app import app

# Vercel serverless function handler
def handler(event, context):
    return app(event, context)

if __name__ == "__main__":
    app.run()

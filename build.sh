docker build -f alpine.Dockerfile -t project/warung-api:1.0.0-development . && docker-compose down &&  docker-compose up -d --force-recreate

docker build -f alpine.Dockerfile -t project/warung-api:1.1.1-production . && docker-compose down &&  docker-compose up -d --force-recreate

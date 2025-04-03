set -e

docker build -t orchestra:latest --platform=linux/amd64 .

docker tag orchestra:latest realartisan/orchestra:latest

docker push realartisan/orchestra:latest

echo "Image pushed to Docker Hub"
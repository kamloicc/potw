#!/bin/bash

# Player of the Week - Quick Start Script

echo "=================================="
echo "Player of the Week - Quick Start"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Ask user which deployment method
echo "Choose deployment method:"
echo "1) Docker Compose (Recommended for testing)"
echo "2) Kubernetes (Production)"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo ""
        echo "Starting with Docker Compose..."
        echo ""
        docker-compose up --build
        ;;
    2)
        echo ""
        echo "Kubernetes Deployment"
        echo ""
        
        # Check if kubectl is installed
        if ! command -v kubectl &> /dev/null; then
            echo "❌ kubectl is not installed. Please install kubectl first."
            exit 1
        fi
        
        echo "Building Docker images..."
        cd backend
        docker build -t player-of-the-week-backend:latest .
        cd ../frontend
        docker build -t player-of-the-week-frontend:latest .
        cd ..
        
        echo ""
        echo "Deploying to Kubernetes..."
        kubectl apply -f k8s/mongodb-deployment.yaml
        kubectl apply -f k8s/minio-deployment.yaml
        kubectl apply -f k8s/backend-deployment.yaml
        kubectl apply -f k8s/frontend-deployment.yaml
        kubectl apply -f k8s/ingress.yaml
        
        echo ""
        echo "✅ Deployed to Kubernetes!"
        echo ""
        echo "Add this to your /etc/hosts file:"
        echo "127.0.0.1 playeroftheweek.local"
        echo ""
        echo "Then access at: http://playeroftheweek.local"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

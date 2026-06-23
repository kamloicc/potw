#!/bin/sh

# Wait for MinIO to be ready
sleep 5

# Configure MinIO client
mc alias set myminio http://minio:9000 minioadmin minioadmin

# Create bucket if it doesn't exist
mc mb myminio/player-videos --ignore-existing

# Set public read policy on the bucket
mc anonymous set download myminio/player-videos

# Set CORS policy
mc anonymous set-json myminio/player-videos <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::player-videos/*"
      ]
    }
  ]
}
EOF

echo "MinIO initialization complete"

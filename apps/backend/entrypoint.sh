#!/bin/bash

# Function to download files from S3
download_from_s3() {
	aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
	aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
	aws s3 cp "$S3_URL" /workspace --recursive && echo "Resources copied from S3"
}

# Check if S3_URL environment variable is set
if [ -z "$S3_URL" ]; then
	echo "S3_URL environment variable is not set. Files from S3 will not be downloaded."
else
	download_from_s3
fi

# Start the main application
exec "$@"

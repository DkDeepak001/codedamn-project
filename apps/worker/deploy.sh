#!/bin/bash

# Check if service name and AWS access key are provided as arguments
if [ $# -lt 2 ]; then
	echo "Usage: $0 <userId> <S3_Url>"
	exit 1
fi

# Store command-line arguments in variables
ARG1="$1"
ARG2="$2"

# Run the Docker container
sudo docker service create --name "$ARG1" -p 3001 -p 4000 -d --network=mynetwork -e S3_URL="$ARG2" -e AWS_ACCESS_KEY_ID= -e AWS_SECRET_ACCESS_KEY= dkdeepak001/codedamn:v0.0.8

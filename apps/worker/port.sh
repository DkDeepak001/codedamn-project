#!/bin/bash

# Function to extract published ports from JSON using jq
extract_ports() {
	local service_name=$1
	local port_mapping=$(sudo docker service inspect "$service_name" | jq -r '.[0].Endpoint.Ports[] | select(.PublishedPort != null) | "\(.TargetPort):\(.PublishedPort)"')
	echo "$port_mapping"
}

# Check if service name is provided as an argument
if [ $# -eq 0 ]; then
	echo "Usage: $0 <service_name>"
	exit 1
fi

# Get assigned ports for the specified service
assigned_ports=$(extract_ports "$1")

echo "$assigned_ports"

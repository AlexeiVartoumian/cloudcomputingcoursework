#!/bin/bash


cur_ip=$(curl ifconfig.co/)
echo $cur_ip
WORKSPACE_DIRECTORY=$(pwd)
Config="config.auto"
if ls *.jinja >/dev/null 2>&1; then
    for f in *.jinja; do
        jinja2 "$f" -D ansible_ip="$cur_ip" > "./$(basename "$f" .jinja).tfvars"
                    
    done 
fi


terraform plan -var-file="${WORKSPACE_DIRECTORY}/${Config}.tfvars"
terraform apply -var-file="${WORKSPACE_DIRECTORY}/${Config}.tfvars"

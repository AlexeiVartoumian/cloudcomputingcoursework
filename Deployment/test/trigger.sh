#!/bin/bash


# ansible db_vm -i inventory.ini -m ping && \
# ansible-playbook -i inventory.ini Ansible/playbook.yml && \
# DB_IP=$(grep -oP '^\d+\.\d+\.\d+\.\d+' inventory.ini) && \
# echo "DB running enter command : mongosh mongodb://${DB_IP}:27017"

#from ubuntu cd /mnt/c/Users/wwwal/Documents/Gcloud/test
# ansible gcp_vm -i inventory.ini -m ping && \
# ansible-playbook -i inventory.ini playbook.yml && \
# VM_IP=$(grep -oP '^\d+\.\d+\.\d+\.\d+' inventory.ini) && \
# echo "App running at http://${VM_IP}:3001" && \ 
# curl http://${VM_IP}:3001/

# ansible all -i inventory.ini -m ping && \
# ansible-playbook inventory.ini Ansible/main.yml && \
# DB_IP=$(awk '/\[db_vm\]/,/^\[/ {if ($1 ~ /^[0-9]/) print $1}' inventory.ini | head -1) && \
# APP_IP=$(awk '/\[app_vm\]/,/^\[/ {if ($1 ~ /^[0-9]/) print $1}' inventory.ini | head -1) && \
# echo "DB running - connect with mongosh mongodb://${DB_IP}:27017" && \
# echo "App running at: http://${APP_IP}:3001" && \
# curl http://${APP_IP}:3001/

echo "Cleaning old SSH host keys..."
grep -oP '^\d+\.\d+\.\d+\.\d+' inventory.ini | while read ip; do
    ssh-keygen -R "$ip" 2>/dev/null
done

export ANSIBLE_HOST_KEY_CHECKING=False

ansible all -i inventory.ini -m ping && \
ansible-playbook -i inventory.ini Ansible/main.yml && \
DB_IP=$(ansible db_vm -i inventory.ini --list-hosts | tail -1 | tr -d ' ') && \
APP_IP=$(ansible gcp_vm -i inventory.ini --list-hosts | tail -1 | tr -d ' ') && \
echo "DB running - connect with mongosh mongodb://${DB_IP}:27017" && \
echo "App running at: http://${APP_IP}:3001" && \
curl http://${APP_IP}:3001/


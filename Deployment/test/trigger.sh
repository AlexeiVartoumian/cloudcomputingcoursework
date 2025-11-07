#!/bin/bash


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


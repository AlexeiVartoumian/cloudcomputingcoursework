[gcp_vm]
${vm_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/gcp-vm-key

[db_vm]
${db_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/gcp-vm-key

[test_suite_vm]
${test_suite_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/gcp-vm-key
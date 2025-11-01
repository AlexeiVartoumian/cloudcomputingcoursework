output "app_vm_ip" {
  value = module.app_vm.vm_ip
}

output "db_vm_ip" {
  value = module.db_vm.vm_ip
}

output "test_suite_vm_ip" {
  value = module.test_suite_vm.vm_ip
}
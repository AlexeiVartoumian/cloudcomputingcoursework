

locals {
  app_public_ip =  module.app_vm.vm_ip
  db_public_ip =  module.db_vm.vm_ip
}

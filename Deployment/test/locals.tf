# locals {
#   app_public_ip = google_compute_instance.vm_instance.network_interface[0].access_config[0].nat_ip
#   db_public_ip = google_compute_instance.db_instance.network_interface[0].access_config[0].nat_ip
# }


locals {
  app_public_ip =  module.app_vm.vm_ip
  db_public_ip =  module.db_vm.vm_ip
}

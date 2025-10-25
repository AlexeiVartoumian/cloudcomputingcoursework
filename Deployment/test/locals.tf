locals {
  app_public_ip = google_compute_instance.vm_instance.network_interface[0].access_config[0].nat_ip
  db_public_ip = google_compute_instance.db_instance.network_interface[0].access_config[0].nat_ip
}

module "vpc_network" {
  source = "./modules/vpc"
}


module "db_vm"{
    source = "./modules/compute"
    ansible_ip =  var.ansible_ip 
    network_name  = module.vpc_network.network_name  
    vm_name = var.db_name
    ssh_key = var.ssh_key
    # source_ranges = [var.ansible_ip , module.app_vm.vm_ip , module.test_suite_vm.vm_ip]
    # ports = var.mongo_db_ports
    target_tags = ["db"]

    # depends_on = [module.app_vm, module.test_suite_vm]

}

module "app_vm"{
    source = "./modules/compute"
    ansible_ip =  var.ansible_ip
    network_name  = module.vpc_network.network_name   
    vm_name = var.vm_name
    ssh_key = var.ssh_key
    # ports = var.app_ports
    target_tags = ["allow-ssh", "web-server"]
}


module "test_suite_vm" {
    source = "./modules/compute"
    ansible_ip = var.ansible_ip
    network_name = module.vpc_network.network_name
    vm_name = var.test_suite_vm_name
    ssh_key = var.ssh_key
    # ports = var.app_ports
    # source_ranges = ["0.0.0.0/0"]
    target_tags = ["allow-ssh", "web-server"]
}

resource "local_file" "ansible_inventory" {
    content = templatefile("${path.module}/inventory.tpl", {
      vm_ip  = module.app_vm.vm_ip
      db_ip = module.db_vm.vm_ip
      test_suite_ip = module.test_suite_vm.vm_ip
    })
    filename = "${path.module}/inventory.ini"

}



module "db_firewall" {
  source = "./modules/firewall"
  name = "db-firewall"
  network_name = module.vpc_network.network_name
  source_ranges = [var.ansible_ip, module.app_vm.vm_ip, module.test_suite_vm.vm_ip]
  ports = ["22", "27017"]
  target_tags = ["db"]
  
  depends_on = [module.db_vm, module.app_vm, module.test_suite_vm]
}

module "app_firewall" {
  source = "./modules/firewall"
  name = "app-firewall"
  network_name = module.vpc_network.network_name
  source_ranges = ["0.0.0.0/0"]
  ports = ["22", "3001"]
  target_tags = ["web-server"]
  
  depends_on = [module.app_vm]
}
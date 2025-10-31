module "vpc_network" {
  source = "./modules/vpc"
}


module "db_vm"{
    source = "./modules/compute"
    ansible_ip =  var.ansible_ip 
    network_name  = module.vpc_network.network_name  
    vm_name = var.db_name
    ssh_key = var.ssh_key
    source_ranges = [var.ansible_ip , module.app_vm.vm_ip]
    ports = var.mongo_db_ports
    target_tags = ["db"]

}

module "app_vm"{
    source = "./modules/compute"
    ansible_ip =  var.ansible_ip
    network_name  = module.vpc_network.network_name   
    vm_name = var.vm_name
    ssh_key = var.ssh_key
    ports = var.app_ports
    target_tags = ["allow-ssh", "web-server"]
}

resource "local_file" "ansible_inventory" {
    content = templatefile("${path.module}/inventory.tpl", {
      vm_ip  = module.app_vm.vm_ip
      db_ip = module.db_vm.vm_ip
    })
    filename = "${path.module}/inventory.ini"

}
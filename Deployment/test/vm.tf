

resource "google_compute_instance" "vm_instance" {
    name = "cloud-computing-class"
    machine_type = "e2-micro"

    boot_disk {
        initialize_params {
            image = "ubuntu-os-cloud/ubuntu-2204-lts"
        }
    }

    network_interface {
        network = "default"
    access_config {

    }
    }
    # prereq run this ssh-keygen -t rsa -b 4096 -C "your-email@example.com" -f ~/.ssh/gcp-vm-key
    metadata = {
        ssh-keys = "ubuntu:${file("~/.ssh/gcp-vm-key.pub")}"
    }

    tags = ["allow-ssh", "web-server"]

}
output "vm_public_ip" {
    description = "Public IP address of the VM instance"
    value       = local.app_public_ip
}

resource "google_compute_network" "vpc_network" {
    name =  "terraform-network"
    auto_create_subnetworks = "true"
}

resource "google_compute_firewall" "ssh_allow" {
    name    = "allow-ssh"
    network = "default"

    allow {
        protocol = "icmp"
    }
    allow {
        protocol = "tcp"
        ports    = ["22", "80", "3001"]
    }

    source_ranges = ["0.0.0.0/0"] 
    target_tags   = ["allow-ssh", "web-server"]
}

resource "local_file" "ansible_inventory" {
    content = templatefile("${path.module}/inventory.tpl", {
      vm_ip  = local.app_public_ip
      db_ip = local.db_public_ip
    })
    filename = "${path.module}/inventory.ini"

}
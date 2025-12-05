

resource "google_compute_instance" "vm_instance" {
    name = var.vm_name
    machine_type = "e2-micro"

    boot_disk {
        initialize_params {
            image = "ubuntu-os-cloud/ubuntu-2204-lts"
        }
    }

    network_interface {
        network = var.network_name
    access_config {

    }
    }
    # prereq run this ssh-keygen -t rsa -b 4096 -C "your-email@example.com" -f ~/.ssh/gcp-vm-key
    metadata = {
        #ssh-keys = "ubuntu:${file("~/.ssh/gcp-vm-key.pub")}"
        ssh-keys = "ubuntu:${var.ssh_key}"
    }

    tags = var.target_tags

}
output "vm_public_ip" {
    description = "Public IP address of the VM instance"
    value       = local.vm_ip
}


# resource "google_compute_firewall" "ssh_allow" {
#     name    = "${var.vm_name}-firewall"
#     network = var.network_name

#     allow {
#         protocol = "icmp"
#     }
#     allow {
#         protocol = "tcp"
#         ports    = var.ports
#     }

#     source_ranges = var.source_ranges
#     target_tags   = var.target_tags
# }

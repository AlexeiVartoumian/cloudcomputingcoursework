variable "ansible_ip" {
    
    type = string
   
}
variable network_name {
    description = "name of the network firewalls and vm will reside in"
}

variable "vm_name"{

    description = "denotes purpose of vm"
    type = string 
}

variable "ssh_key" {
    description = "ssh key used for ansible and general"
    type = string
}

# variable "ports" {
#     description = "the ports to be allowed access"
#     type = list(string)
# }

# variable "source_ranges" {
#     description = "basic config"
#     type = list(string) 
#     default = ["0.0.0.0/0"]
# }
variable "target_tags" {
    description = "specify firewall for vm"
    type = list(string)
}

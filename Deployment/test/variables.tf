variable "ansible_ip" {
    type = string    
}

variable "vm_name"{
    type = string
    default = "cloud-computing-class"
}

variable "test_suite_vm_name" {
    type = string
    default= "test-suite-vm"
}

variable "db_name"{
    type = string
    default = "db"
}

variable "ssh_key" {
    type = string
    //default = "ubuntu:${file("~/.ssh/gcp-vm-key.pub")}"
}
variable "mongo_db_ports" {
    type = list(string)
    default =  ["22", "27017"]
} 

variable "app_ports" {
    type = list(string)
    default = ["22", "80", "3001"]
} 


variable "target_tags" {
 type = list(string)
 default = [ "vm" ]
}


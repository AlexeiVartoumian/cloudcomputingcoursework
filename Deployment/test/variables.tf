variable "ansible_ip" {
    type = string    
}

variable "vm_name"{
    default = "cloud-computing-class"
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

variable "source_ranges" {
    description = "please set this"
    default = ["127.0.0.1"]
}
variable "target_tags" {
 type = list(string)
 default = [ "vm" ]
}
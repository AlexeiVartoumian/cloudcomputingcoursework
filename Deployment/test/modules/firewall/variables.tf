variable "name" {
  type = string
}

variable "network_name" {
  type = string
}

variable "source_ranges" {
  type = list(string)
}

variable "ports" {
  type = list(string)
}

variable "target_tags" {
  type = list(string)
}
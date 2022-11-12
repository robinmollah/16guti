variable "bucket_name" {
  default = "doshguti"
}

variable "storage_class" {
  description = "any of STANDARD, NEARLINE, COLDLINE, ARCHIVE"
  default = "STANDARD"
}

variable "bucket_location" {
  description = "e.g.  ASIA-SOUTH2"
  default = "ASIA-SOUTH2"
}

variable "project_id" {
  description = "e.g. robinsajin"
  default = "robinsajin"
}


resource "google_storage_bucket" "default" {
  name = var.bucket_name
  storage_class = var.storage_class
  location = var.bucket_location
  project = var.project_id
}

resource "google_storage_bucket_access_control" "public_rule" {
  bucket = var.bucket_name
  role   = "READER"
  entity = "allUsers"
}

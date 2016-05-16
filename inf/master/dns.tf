resource "aws_route53_record" "a-sm" {
   zone_id = "${var.zone_seandonmooy}"
   name = "seandonmooy.com"
   type = "A"
   ttl = "300"
   records = ["${google_compute_address.erulabs.address}"]
}

resource "aws_route53_record" "www-sm" {
  zone_id = "${var.zone_seandonmooy}"
  name = "www.seandonmooy.com"
  type = "CNAME"
  ttl = "3600"
  records = ["seandonmooy.com"]
}

resource "aws_route53_record" "a-el" {
   zone_id = "${var.zone_erulabs}"
   name = "erulabs.com"
   type = "A"
   ttl = "300"
   records = ["${google_compute_address.erulabs.address}"]
}

resource "aws_route53_record" "www-el" {
  zone_id = "${var.zone_erulabs}"
  name = "www.erulabs.com"
  type = "CNAME"
  ttl = "3600"
  records = ["erulabs.com"]
}

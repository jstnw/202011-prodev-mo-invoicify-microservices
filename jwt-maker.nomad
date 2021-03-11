job "jwt-maker" {
  datacenters = ["dc1"]

  type = "service"

  group "jwt-maker" {
    count = 1
    
    task "jwt-maker" {
      driver = "docker"
      config {
        image = "jwt-maker:local"
        ports = ["http"]
      }

      resources {
        network {
          port "http" {
            to = 80
          }
        }

        cpu    = 200 #200MHz
        memory = 128 #128MB
      }

      service {
        name = "jwt-maker"
        tags = ["global", "jwt-maker"]
        port = "http"

        check {
          type = "http"
          path = "/"
          interval = "5s"
          timeout = "2s"
        }
      }

      env {
        PGUSER = "invoicify_dev"
        PGPASSWORD = "password"
        PGDATABASE = "invoicify_dev"
        JWT_SECRET = "vinfkltnglkdnll"
        PORT = "80"
        WAIT_HOSTS = "pg:5432,jwt-maker:80"
        WAIT_HOSTS_TIMEOUT = 60
      }
    }
  }
}
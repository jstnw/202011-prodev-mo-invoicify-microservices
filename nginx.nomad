job "nginx" {
  datacenters = ["dc1"]

  type = "service"

  group "nginx" {
    count = 1
    
    task "nginx" {
      driver = "docker"
      config {
        image = "nginx:local"
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
        name = "nginx"
        tags = ["global", "nginx"]
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
        WAIT_HOSTS = "pg:5432,nginx:80"
        WAIT_HOSTS_TIMEOUT = 60
      }
    }
  }
}
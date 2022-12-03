docker stop 10guti
docker rm 10guti
docker build . -t 10guti
docker run -p 3050:3050 --name 10guti 10guti

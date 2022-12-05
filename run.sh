sudo docker stop 10guti
sudo docker rm 10guti
sudo docker build . -t 10guti
sudo docker run -d -p 3050:3050 -p 8305:8305 --name 10guti 10guti

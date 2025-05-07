npm run-script build
docker build -t georgetagirov/bitflex-frontend . --platform linux/amd64
# docker run -dit -p 443:443 georgetagirov/bitflex-frontend
docker push georgetagirov/bitflex-frontend 

ssh george@141.101.196.122 'docker pull georgetagirov/bitflex-frontend && docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker run --restart always -dit -p 8081:80 georgetagirov/bitflex-frontend'
# ssh root@157.245.103.214 'docker pull georgetagirov/bitflex-frontend && docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker run -dit -p 443:443 georgetagirov/bitflex-frontend'
# ssh root@188.166.255.145 'docker pull georgetagirov/bitflex-frontend && docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker run -dit -p 443:443 georgetagirov/bitflex-frontend'
# ssh root@104.131.115.172 'docker pull georgetagirov/bitflex-frontend && docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker run -dit -p 443:443 georgetagirov/bitflex-frontend'

git add -u :/
git commit -m "Updated: `date +'%Y-%m-%d %H:%M:%S'`"
git push
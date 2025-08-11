npm run-script build
docker build -t georgetagirov/bitflex-frontend . --platform linux/amd64
# docker run -dit -p 443:443 georgetagirov/bitflex-frontend
docker push georgetagirov/bitflex-frontend 

# Free space on remote host before pulling to prevent no-space errors
ssh george@141.101.196.122 '
	set -euo pipefail
	df -h || true;
	docker stop $(docker ps -aq) 2>/dev/null || true;
	docker rm $(docker ps -aq) 2>/dev/null || true;
	docker system prune -af --volumes || true;
	docker builder prune -af || true;
	docker image prune -af || true;
	df -h || true;
	docker pull georgetagirov/bitflex-frontend && 
	docker run --restart always -dit -p 8081:80 georgetagirov/bitflex-frontend
'
# ssh root@157.245.103.214 'docker pull georgetagirov/bitflex-frontend && docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker run -dit -p 443:443 georgetagirov/bitflex-frontend'
# ssh root@188.166.255.145 'docker pull georgetagirov/bitflex-frontend && docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker run -dit -p 443:443 georgetagirov/bitflex-frontend'
# ssh root@104.131.115.172 'docker pull georgetagirov/bitflex-frontend && docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker run -dit -p 443:443 georgetagirov/bitflex-frontend'

git add -u :/
git commit -m "Updated: `date +'%Y-%m-%d %H:%M:%S'`"
git push
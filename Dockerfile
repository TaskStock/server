FROM node:18-alpine

#bycrpt와 alpine 사이의 문제로 인한 python 설치
RUN apk --no-cache add --virtual builds-deps build-base python3

# 앱 디렉터리 생성
WORKDIR /ts/app

COPY package*.json ./

# RUN npm install && npm install -g pm2
RUN npm install

COPY . .

EXPOSE 8000

# pm2와 docker는 같이 사용하면 의미가 없으므로 pm2 사용 x
# pm2-runtime으로 실행 - 포어그라운드에서 실행되어 컨테이너 오케스트레이션 시스템과의 통합이 용이하다.
# CMD ["pm2-runtime", "start", "ecosystem.config.js"]

CMD ["npm", "start"]
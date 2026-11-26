# 1단계: 정적 파일 빌드
FROM node:26.13-alpine AS build
WORKDIR /app

# lock 파일 그대로 설치하고 설치 스크립트는 실행하지 않는다(공급망 공격 대비)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

# VITE_ 값은 빌드할 때 번들에 들어간다. 공개돼도 되는 값만 넣는다.
# VITE_API_BASE_URL은 비워 둔다(같은 주소로 요청하고 nginx가 BE로 넘긴다).
ARG VITE_API_BASE_URL=""
ARG VITE_TOSS_CLIENT_KEY=""
ARG VITE_VAPID_PUBLIC_KEY=""
ENV VITE_USE_MOCK=false \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_TOSS_CLIENT_KEY=$VITE_TOSS_CLIENT_KEY \
    VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY

RUN npm run build

# 2단계: nginx로 화면 제공과 BE 프록시
FROM nginx:1.30-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

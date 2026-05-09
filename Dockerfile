FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache tzdata

ENV TZ=Asia/Shanghai

COPY target/*.jar app.jar

ENV DB_HOST=1Panel-mysql \
    DB_PORT=3306 \
    DB_USERNAME=root \
    DB_PASSWORD=admin \
    REDIS_HOST=1Panel-redis \
    REDIS_PASSWORD=admin

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]

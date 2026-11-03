FROM maven:3.9-openjdk-21 AS build
WORKDIR /app
COPY src/pom.xml ./pom.xml
COPY src/src ./src
RUN mvn clean package -DskipTests

FROM openjdk:21-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
CMD ["java", "-jar", "app.jar", "--server.port=8080"]

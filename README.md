# Spring Micro Service Project

## Goal
#### Micro Service Architecture 실습을 위한 마이크로 서비스 개발
#### 다중 기술 스택 환경 테스트를 위해 Spring 이용한 개발

## Role
#### 제공자들이 사용하는 클라이언트 구현
#### 사용자들은 소비자들에게 Order를 제공할 수 있다.

## Environment
#### Front-End
#### Back-End: Spring Boot / Java / Gradle

## About Branch
### IDE to Git branch
### To Manage Version
=======
#### 해당 브랜치는 추후 CI/CD Automation 구현 및 Github Action을 통한 Docker 컨테이너화 적용 테스트를 위한 브랜치입니다.
#### 사용자는 IDE에서 코드 작성 후 이 브랜치에 commit하지 마세요.
#### spring-micro-service에서 코드 리뷰 및 테스트가 완료된 브랜치에 대해 해당 브랜치에 PR을 올리며, PR 후 해당 브랜치와 커밋됨과 동시에 Docker를 통해 컨테이너화가 진행되고 이어 Kubernetes로 전달되어야 한다.

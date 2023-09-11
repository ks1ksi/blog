---
title: Beanstalk 환경변수 추출
author: Seungil Kim
description: Elastic Beanstalk으로 배포한 애플리케이션의 환경 변수를 얻어보자.
postSlug: Beanstalk 환경변수 추출
featured: false
tags:
  - AWS
pubDatetime: 2023-09-12T02:00:30+09:00
---
# Beanstalk 환경변수 추출

prisma db 설정 문제로 EC2에 접속하여 직접 npm run start를 하려고 했는데 환경 변수가 주입되어 있지 않았다.

![[Beanstalk 환경변수 추출-1694451989390.jpeg]]

AWS Elastic Beanstalk를 통해 배포된 애플리케이션의 경우, 환경 변수는 일반적으로 EC2 인스턴스 내에서 `/opt/elasticbeanstalk/bin/get-config` 스크립트를 사용하여 조회할 수 있다고 한다.

기본 포맷은 `JSON`이다. `--output YAML` 옵션으로 YAML 형태로 출력하도록 하고, 이걸 .env에 넣고 실행하면 된다.

배포한 애플리케이션은 `/var/app/current`에 위치한다. 해당 경로로 이동한 후에

```sh
sudo /opt/elasticbeanstalk/bin/get-config --output YAML environment > .env
```

![[Beanstalk 환경변수 추출-1694452040551.jpeg]]
성공..!

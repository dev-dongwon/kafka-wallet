# 입출금 API 개발 - 백엔드 엔지니어 지원 김동원
## Description
- 본 프로젝트는 nest.js에서 지원하는 kafka microservice를 활용해 만들었습니다.
- 가상의 거래소에서 실제로 입출금 이벤트가 대량으로 발생하는 상황을 가정, ```안정적인 request 전달과 메시지 큐잉```이 필요하다는 판단에서 해당 기술을 선택했습니다.

- 구조는 크게 ```api server, kafka broker, consumer server```로 나누어져 있습니다.
  - api server: 최초 요청 및 최종 자원 확인
  - kafka broker: 안정적인 요청 전달 및 메시지 큐잉
  - consumer server: 자원 생성 및 비즈니스 로직 처리

- 자원의 생성 및 비즈니스 로직 처리는 consumer에서, 요청 및 응답 전달, 최종 자원 확인은 api server에서 담당합니다.
- 직접 db를 조회할 수 있는 일부 get method의 경우 kafka를 거치지 않고 api server에서 직접 처리합니다

## 폴더 구조
- apps
  - api
    - api microservice server
    - consumer server에 요청하고 응답을 내려주는 api controller 포함
    - port: 3000
  - consumer
    - consumer microservice server
    - api server에서 메시지를 받아 비즈니스 로직 처리 후 api에 응답 반환
    - port: 3001
- common
  - constant: 코드에 쓰이는 상수 모음
  - database: typeorm 및 postgres 연결에 필요한 서비스
  - entiy: active record를 위해 상속할 base entity
  - enums: enum 모음
  - module
    - transaction: transaction 관련 로직을 처리하는 공통 모듈
    - wallet: wallet 관련 로직을 처리하는 공통 모듈
## 사용 기술
```bash
$ 사용 프레임워크 및 인프라: nest.js, kafka, Docker, Docker-compose
$ 언어: typescript
$ 데이터베이스: PostgresSQL, typeorm
$ 테스트: jest
```
## 인스톨 및 실행
```bash
$ yarn install

이후 root folder (/wallet) 에서
$ docker-compose up

** docker 이미지가 다소 무거워 완전한 구동까지 1-2분 정도로, 다소 시간이 걸릴 수 있습니다
```

## Unit Test
```bash
$ yarn run test
```

## base url
```bash
$ http://localhost:3000
```

## kafka UI
```bash
아래 주소에서 kafka에서 생성된 토픽 및 메시지를 확인할 수 있습니다
$ http://localhost:8080
```


## API 스펙

```1. POST /api/wallets```
- 기능
  - 지갑 생성 엔드포인트
- Body Parameter
  - balance (number, required) : 지갑의 잔액

- Response
  - id (string, required) : 지갑의 고유 UUID
  - availableBalance (string, required) : 지갑의 사용 가능한 잔액
  - pendingDeposit (string, required, default="0") : 현재 보류 중인 송금액
  - pendingWithdraw (string, required, default="0") : 현재 보류 중인 출금액I
  - createdAt (Date, required) : 지갑이 생성된 시간
  - updatedAt (Date, required) : 지갑의 정보가 갱신된 시간
  - deletedAt (Date, optional) : 지갑이 삭제된 시간 (optional)

- response example
  - ```json
    {
      "id": "edf404cf-906d-4aae-8b10-83f30ca34579",
      "availableBalance": "5",
      "pendingDeposit": "0",
      "pendingWithdraw": "0",
      "createdAt": "2023-06-12T06:40:32.920Z",
      "updatedAt": "2023-06-12T06:40:32.920Z"
    }
    ```

- error response
  - ```422 CREATE_RESOURCE_FAILED```: 자원 생성 실패 시 에러 반환
    ```json
      {
        "statusCode": 422,
        "message": "failed to create resource, please retry after a few seconds",
        "error": "Unprocessable Entity"
      }
    ```

```2. POST api/transactions```
- 기능
  - 입출금 엔드포인트
- Body Parameter
  - walletId (string, required) : 입출금 요청 계좌의 고유 uuid
  - type (string, required): 입출금 종류
    - "withdraw" | "deposit": 해당 두 문자열만 허용
    - withdraw: 출금
    - deposit: 입금
  - amount (number, required): 입.출금할 금액
- Response
  - id (number, required) : 입.출금한 트랜잭션의 id
  - walletId (string, required) : 입.출금 요청 계좌의 고유 uuid
  - amount (number, required) : 현재 입금 혹은 출금 요청한 금액
  - type (string, required) : 입출금 종류
    - withdraw: 출금
    - deposit: 입금
  - status (string, required) : 입.출금이 처리되었는지 여부
    - "pending" | "completed": 해당 두 문자열만 허용
    - pending: 현재 입.출금 상태 보류됨
    - completed: 현재 입.출금 상태 완료됨
  - createdAt (Date, required) : 입.출금 트랜잭션이 생성된 시간
  - updatedAt (Date, required) : 입.출금 트랜잭션 정보가 갱신된 시간

- response example
  - ```json
    {
        "id": "edf404cf-906d-4aae-8b10-83f30ca34579",
        "availableBalance": "5",
        "pendingDeposit": "0",
        "pendingWithdraw": "0",
        "createdAt": "2023-06-12T06:40:32.920Z",
        "updatedAt": "2023-06-12T06:40:32.920Z"
    }
    ```
- error response
  - ```422 FAILED_TASK_PROCESSING```: 자원 생성 로직 실패 시 에러 반환
    ```json
      {
        "statusCode": 422,
        "message": "failed to process task",
        "error": "Unprocessable Entity"
      }
    ```
  - ```404 RESOURCE_NOT_FOUND```: 자원 생성 후 해당 자원을 찾을 수 없을 때 에러 반환
    ```json
      {
        "statusCode": 404,
        "message": "resource is not found",
        "error": "Not Found"
      }
    ```

```3. PATCH api/transactions```
- 기능
  - 거래(입출금) 처리 엔드포인트
- Parameter
  - 없음
- Response
  - completedDepositCount (number, required): 처리 완료된 입금 트랜잭션 수
  - completedWithdrawCount (number, required): 처리 완료된 출금 트랜잭션 수

- response example
  - ```json
    {
        "completedDepositCount": 2,
        "completedWithdrawCount": 0
    }
    ```
- error response
  - ```422 FAILED_TASK_PROCESSING```: 자원 생성 로직 실패 시 에러 반환
    ```json
      {
        "statusCode": 422,
        "message": "failed to process task",
        "error": "Unprocessable Entity"
      }
    ```
  - ```404 RESOURCE_NOT_FOUND```: 자원 생성 후 해당 자원을 찾을 수 없을 때 에러 반환
    ```json
      {
        "statusCode": 404,
        "message": "resource is not found",
        "error": "Not Found"
      }
    ```
```4. GET api/wallets/:id```
- 기능
  - 지갑(잔액) 조회 엔드포인트
- Path Parameter
  - id (string, required): 요청할 지갑 고유 uuid
- Response
  - id (string, required) : 지갑의 고유 UUID
  - availableBalance (string, required) : 지갑의 사용 가능한 잔액
  - pendingDeposit (string, required, default="0") : 현재 보류 중인 송금액
  - pendingWithdraw (string, required, default="0") : 현재 보류 중인 출금액I
  - createdAt (Date, required) : 지갑이 생성된 시간
  - updatedAt (Date, required) : 지갑의 정보가 갱신된 시간
  - deletedAt (Date, optional) : 지갑이 삭제된 시간 (optional)

- response example
  - ```json
    {
      "id": "edf404cf-906d-4aae-8b10-83f30ca34579",
      "availableBalance": "5",
      "pendingDeposit": "0",
      "pendingWithdraw": "0",
      "createdAt": "2023-06-12T06:40:32.920Z",
      "updatedAt": "2023-06-12T06:40:32.920Z"
    }
    ```
- error response
  - ```404 RESOURCE_NOT_FOUND```: 해당 자원을 찾을 수 없을 때 에러 반환
    ```json
      {
        "statusCode": 404,
        "message": "resource is not found",
        "error": "Not Found"
      }
    ```

```5. GET api/transactions?walletId=""&limit=""&startIndex=""&order=""&status=""```
- 기능
  - 거래(입출금) 내역 리스트 조회 엔드포인트
- Query Parameter
  - walletId (string, required): 요청할 지갑 고유 uuid
  - limit (string, optional, default=10): 요청할 트랜잭션 최대 개수
  - startIndex (string, optional, default=1): 자원 요청 시작 인덱스
  - order (string, optional, default="DESC"): 자원 정렬 순서
    - "ASC" | "DESC" : 해당 값만 허용
    - 정렬 기준은 현재 자원 생성 시간인 "createdAt"으로 정렬
  - status (string, optional, default=없음): 자원 처리 상태 별로 가져오고 싶을 때 설정
    - "pending" | "completed": 해당 값만 허용
    - 값이 없을 경우 처리 중이거나 처리됨 상태 모두 출력
- Response
  - { transactions: transaction[], metadata: { totalCount: number, nextIndex: number, lastIndex: number } } 형태로 응답
    - transaction
      - id (number, required) : 입.출금한 트랜잭션의 id
      - walletId (string, required) : 입.출금 요청 계좌의 고유 uuid
      - amount (number, required) : 현재 입금 혹은 출금 요청한 금액
      - type (string, required) : 입출금 종류
        - withdraw: 출금
        - deposit: 입금
      - status (string, required) : 입.출금이 처리되었는지 여부
        - "pending" | "completed": 해당 두 문자열만 허용
        - pending: 현재 입.출금 상태 보류됨
        - completed: 현재 입.출금 상태 완료됨
      - createdAt (Date, required) : 입.출금 트랜잭션이 생성된 시간
      - updatedAt (Date, required) : 입.출금 트랜잭션 정보가 갱신된 시간
    - metadata
      - totalCount (number, required): 전체 자원의 수
      - nextIndex (number | null, required): 다음 인덱스
        - 다음 인덱스가 없을 경우 null 반환
      - lastIndex (number, required): 마지막 인덱스

- response example
  - ```json
      {
          "transactions": [
              {
                  "id": 7,
                  "walletId": "ad0ff706-a4bb-4d14-a844-2610c1689ff1",
                  "amount": "100000000",
                  "type": "deposit",
                  "status": "pending",
                  "createdAt": "2023-06-12T09:54:57.759Z",
                  "updatedAt": "2023-06-12T09:54:57.759Z"
              },
              {
                  "id": 6,
                  "walletId": "ad0ff706-a4bb-4d14-a844-2610c1689ff1",
                  "amount": "100000000",
                  "type": "deposit",
                  "status": "completed",
                  "createdAt": "2023-06-12T09:54:10.821Z",
                  "updatedAt": "2023-06-12T09:54:15.033Z"
              }
          ],
          "metadata": {
              "totalCount": 7,
              "nextIndex": 2,
              "lastIndex": 4
          }
      }
    ```





## End

소중한 시간 내주셔서 감사합니다.
김동원 드림

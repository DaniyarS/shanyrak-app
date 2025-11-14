# SHANYRAK API Documentation

API Documentation

**Base URL:** ``

---

## all

**GET** `/api/v1/categories`

---

## category

**GET** `/api/v1/categories/5414ea67-5f82-4514-82e9-61afe37234cf`

---

## children

**GET** `/api/v1/categories/f184baa9-543e-4eea-ae10-022c8fce5d1e/children`

---

## 1. send-otp

**POST** `/api/v1/auth/send-otp`

### Headers

- `Content-Type`: application/json

### Request Body

```json
{
  "phone": "77076770099"
}
```

---

## 2. register

**POST** `/api/v1/auth/register`

### Headers

- `Content-Type`: application/json

### Request Body

```json
{
  "phone": "77076770099",
  "password": "qwerty123",
  "role": "BUILDER",
  "firstName": "Daniyar",
  "lastName": "Slamkul",
  "otpCode": "9459"
}
```

---

## 3. login

**POST** `/api/v1/auth/login`

### Headers

- `Content-Type`: application/json

### Request Body

```json
{
  "login": "77076770099",
  "password": "qwerty123"
}
```

---

## 4. refresh-token

**POST** `/api/v1/auth/refresh`

### Headers

- `Content-Type`: application/json

### Request Body

```json
{
  "refreshToken": "989029d5-f242-4c69-bfc3-203711f099ca"
}
```

---

## 5. reset-password

**POST** `/api/v1/auth/reset-password`

### Headers

- `Content-Type`: application/json

### Request Body

```json
{
  "phone": "77076770099",
  "otpCode": "5555",
  "newPassword": "qwerty111"
}
```

---

## createEstate

**POST** `/api/v1/estates`

### Request Body

```json
{
  "kind": "kindTest",
  "email": "emailTest",
  "addressLine": "addressLineTest",
  "city": "cityTest",
  "district": "districtTest",
  "lat": "1123",
  "lon": "1233",
  "areaM2": "49.9",
  "floor": "7"
}
```

---

## update

**PUT** `/api/v1/estates`

### Request Body

```json
{
  "publicId": "ebb078f0-d138-4878-8df0-0109218480ca",
  "kind": "kindTest",
  "email": "emailTest",
  "addressLine": "addressLineTest",
  "city": "cityTest",
  "district": "hahaha",
  "lat": 1123,
  "lon": 3221,
  "areaM2": 49.9,
  "floor": 7
}
```

---

## getCustomerEstates

**GET** `/api/v1/estates`

### Request Body

```json
{
  "kind": "kindTest",
  "email": "emailTest",
  "addressLine": "addressLineTest",
  "city": "cityTest",
  "district": "districtTest",
  "lat": "1123",
  "lon": "1233",
  "areaM2": "49.9",
  "floor": "7"
}
```

---

## delete

**DELETE** `/api/v1/estates/9a818ca4-48db-4eb0-951b-d6fb5e19c7e4`

### Request Body

```json
{
  "kind": "kindTest",
  "email": "emailTest",
  "addressLine": "addressLineTest",
  "city": "cityTest",
  "district": "districtTest",
  "lat": "1123",
  "lon": "1233",
  "areaM2": "49.9",
  "floor": "7"
}
```

---

## createOrder

**POST** `/api/v1/orders`

### Request Body

```json
{
  "category": {
    "publicId": "075110d6-2a72-48fc-b0cf-93df38b79c16"
  },
  "realEstate": {
    "publicId": "552d936b-4c64-47a8-9d6a-d84a861ecd03"
  },
  "order": {
    "title": "Натяжной потолок",
    "description": "Надо сделать за кв метр готов 2000тг",
    "budjetMin": 1000,
    "budjetMax": 2000
  }
}
```

---

## update

**PUT** `/api/v1/orders`

### Request Body

```json
{
  "uuid": "ddabc63a-96d0-4956-aa23-19932dc08542",
  "title": "Натяжной потолок",
  "description": "Надо сделать за кв метр готов 3000тг",
  "budgetMin": 1000,
  "budgetMax": 0,
  "unit": "areaM2"
}
```

---

## delete

**DELETE** `/api/v1/orders/ddabc63a-96d0-4956-aa23-19932dc08542`

### Request Body

```json
{
  "category": {
    "publicId": "075110d6-2a72-48fc-b0cf-93df38b79c16"
  },
  "realEstate": {
    "publicId": "552d936b-4c64-47a8-9d6a-d84a861ecd03"
  },
  "order": {
    "title": "Натяжной потолок",
    "description": "Надо сделать за кв метр готов 2000тг",
    "budjetMin": 1000,
    "budjetMax": 2000
  }
}
```

---

## search

**GET** `/api/v1/orders`

### Query Parameters

- `page`
- `size`
- `sort`
- `categoryPublicId`
- `budgetMinFrom`
- `createdFrom`
- `createdTo`
- `city`
- `areaFrom`
- `q`

---

## customer

**GET** `/api/v1/orders/customer`

### Query Parameters

- `page`
- `size`
- `sort`

---

## requestPhone new

**POST** `/api/v1/orders/9aa84dd2-0fb5-4c9b-b4cf-cb0b1b5304f1/request-phone`

### Request Body

```json
{
  "offerPublicId": "378af8ca-a9ca-4c36-b996-f15bd127d971"
}
```

---

## send

**POST** `/api/v1/offers`

### Request Body

```json
{
  "order": {
    "uuid": "1e1ecb87-c1a6-4770-9459-7bd393916cff"
  },
  "offer": {
    "price": 1200,
    "message": "Братан за 1200 никто не предложит",
    "unit": "m2",
    "daysEstimate": 3
  }
}
```

---

## searchByOrder

**GET** `/api/v1/offers`

### Query Parameters

- `orderId`
- `sort`
- `page`
- `size`

---

## myOffers

**GET** `/api/v1/offers/my`

### Query Parameters

- `orderId`
- `sort`
- `page`
- `size`

---

## getOfferBuilder new

**GET** `/api/v1/offers/378af8ca-a9ca-4c36-b996-f15bd127d971/builder`

---

## update new

**PUT** `/api/v1/offers/378af8ca-a9ca-4c36-b996-f15bd127d971`

### Request Body

```
{   
    "price": 1200,
    "unit": "m3",
    "daysEstimate": 3,
    "message": "Братан за 1200 никто не предложит"
}

//Можно только если статус = PENDING
```

---

## delete new

**DELETE** `/api/v1/offers/378af8ca-a9ca-4c36-b996-f15bd127d971`

### Request Body

```
{   
    "price": 1200,
    "unit": "m3",
    "daysEstimate": 3,
    "message": "Братан за 1200 никто не предложит"
}

//Можно только если статус = PENDING
```

---

## byOrder

**GET** `/api/v1/contracts/by-order`

### Query Parameters

- `orderId`

---

## byId

**GET** `/api/v1/contracts/9582eaba-baf5-4c26-af0e-b05528a3031c`

---

## confirm-deal new

**POST** `/api/v1/orders/9aa84dd2-0fb5-4c9b-b4cf-cb0b1b5304f1/confirm-deal`

### Request Body

```
  {
    "offerPublicId": "378af8ca-a9ca-4c36-b996-f15bd127d971",
    "agreed": true,
    "startDate": "2025-01-15",
    "endDate": "2025-02-15"
  }

/*  Если agreed = true:
  - Создается ContractEntity (статус ACTIVE)
  - Оффер → ACCEPTED
  - Все остальные офферы → REJECTED

  Если agreed = false:
  - Оффер → REJECTED
  - Заказ → обратно в OPEN
*/
```

---

## complete new

**POST** `/api/v1/contracts/059a3686-771a-4f52-ab52-46e559a2d86a/complete`

### Request Body

```
{
    "completed" : true
}

/*Завершение контракта (двустороннее) ✅
 Логика:
  - Определяется роль пользователя (customer/builder)
  - Устанавливается флаг customerConfirmedComplete или builderConfirmedComplete
  - Если ОБЕ стороны подтвердили → Контракт COMPLETED, Order COMPLETED
  - Если только одна → статус PENDING_COMPLETION
  - Автоматически увеличивается jobsDone у строителя



*/
```

---

## search

**GET** `/api/v1/builders/search`

### Query Parameters

- `city`
- `ratingFrom`
- `categoryPublicId`
- `page`
- `size`
- `sort`
- `q`
- `priceFrom`
- `priceTo`
- `availability`

---

## me

**GET** `/api/v1/builders/me`

---

## builder

**GET** `/api/v1/builders/ceb3f0b3-3122-48d0-ba39-e256fe291d4b`

---

## update

**PUT** `/api/v1/builders/2ad93af8-75d4-4936-b98d-4c5d66458805`

### Request Body

```json
{
  "password": null,
  "fullName": "Данияр строитель",
  "email": "daniyarslamkul@gmail.com",
  "phone": "87076770092",
  "avatarLink": "",
  "role": "BUILDER",
  "token": null,
  "login": "daniyars",
  "ratingAvg": 2,
  "aboutMe": "Опытный электрик",
  "experienceYears": 10,
  "city": "Алматы",
  "district": "Besagash",
  "jobsDone": 15,
  "available": true,
  "priceList": null
}
```

---

## addCategory

**POST** `/api/v1/builders/2ad93af8-75d4-4936-b98d-4c5d66458805/category`

### Request Body

```json
{
  "category": {
    "publicId": "f184baa9-543e-4eea-ae10-022c8fce5d1e"
  },
  "price": "1200",
  "description": "1 кубын куямыз осы акшага"
}
```

---

## category/delete

**DELETE** `/api/v1/builders/category/1`

---

## update

**PUT** `/api/v1/builders/category/2`

### Request Body

```json
{
  "price": "1400",
  "description": "багасы котерилди"
}
```

---

## uploadAvatar

**POST** `/api/v1/files/upload`

### Request Body

```json
{
  "mode": "formdata",
  "formdata": [
    {
      "key": "file",
      "type": "file",
      "src": "/Users/daniyars/Downloads/Gemini_Generated_Image_fribz7fribz7frib.png"
    },
    {
      "key": "scope",
      "value": "avatars",
      "type": "text"
    },
    {
      "key": "linkType",
      "value": "USER_AVATAR",
      "type": "text"
    }
  ]
}
```

---

## uploadOrderPhoto

**POST** `/api/v1/files/upload`

### Request Body

```json
{
  "mode": "formdata",
  "formdata": [
    {
      "key": "file",
      "type": "file",
      "src": "/Users/kaspi/Documents/1111.jpg"
    },
    {
      "key": "scope",
      "value": "orders",
      "type": "text"
    },
    {
      "key": "linkType",
      "value": "ORDER_PHOTO",
      "type": "text"
    },
    {
      "key": "linkPublicId",
      "value": "9aa84dd2-0fb5-4c9b-b4cf-cb0b1b5304f1",
      "type": "text"
    }
  ]
}
```

---

## uploadBuilderPortfolio

**POST** `/api/v1/files/upload`

### Request Body

```json
{
  "mode": "formdata",
  "formdata": [
    {
      "key": "file",
      "type": "file",
      "src": "/Users/kaspi/Documents/1111.jpg"
    },
    {
      "key": "scope",
      "value": "portfolio",
      "type": "text"
    },
    {
      "key": "linkType",
      "value": "BUILDER_PORTFOLIO",
      "type": "text"
    },
    {
      "key": "sortOrder",
      "value": "0",
      "type": "text"
    }
  ]
}
```

---

## getBuildersPortfolioPhotos

**GET** `/api/v1/files`

### Query Parameters

- `linkType`
- `linkPublicId` - builder's public id

---

## getOrderPhotos

**GET** `/api/v1/files`

### Query Parameters

- `linkType`
- `linkPublicId` - order's public

---

## getAvatarPhoto

**GET** `/api/v1/files`

### Query Parameters

- `linkType`
- `linkPublicId` - Optional param, for user want's to get other user's avatar by using his publicId

---

## delete

**DELETE** `/api/v1/files/1df07d31-bf1e-44b0-ad76-8ed67c53e2cf`

---

## review new

**POST** `/api/v1/reviews`

### Request Body

```
  {
    "contractPublicId": "059a3686-771a-4f52-ab52-46e559a2d86a",
    "rating": 5,
    "message": "Отличная работа!"
  }
/*
  Логика:
  - Только для завершенных контрактов (COMPLETED)
  - Заказчик оценивает строителя → обновляется builder.ratingAvg
  - Строитель оценивает заказчика
  - Один отзыв от каждой стороны
*/
```

---

## getBuilderReviews new

**GET** `/api/v1/reviews/builder/{builderPublicId}`

### Query Parameters

- `page`
- `size`
- `sort`

---

## review new

**GET** `/api/v1/reviews/{reviewPublicId}`

---


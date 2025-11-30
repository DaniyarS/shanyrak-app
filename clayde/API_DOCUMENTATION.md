# SHANYRAK API Documentation

API Documentation

**Base URL:** ``

---

## create

**POST** `/api/v1/waste`

### Request Body

```json
{
  "title": "Остатки кирпича M150",
  "description": "Около 200 штук",
  "categoryPublicId": "1e6e56f5-d942-4174-a5ea-79ab004c6e5f",
  "city": "Алматы",
  "district": "Наурызбай",
  "unit": "pcs",
  "amount": 200,
  "price": 0
}
```

---

## update

**PUT** `/api/v1/waste/{publicId}`

/api/v1/waste/{waste's public id}

### Request Body

```json
{
  "title": "Остатки кирпича M150",
  "description": "Около 200 штук",
  "categoryPublicId": "uuid",
  "city": "Алматы",
  "district": "Наурызбай",
  "unit": "pcs",
  "amount": 200,
  "price": 0
}
```

---

## setStatus

**PATCH** `/api/v1/waste/{publicId}/status`

/api/v1/waste/{waste's public id}/status

### Request Body

```json
{
  "status": "SOLD"
}
```

---

## delete

**DELETE** `/api/v1/waste/359a4646-9202-4247-a86c-68699a387987`

/api/v1/waste/{waste's public id}

---

## search

**GET** `/api/v1/waste`

### Query Parameters

- `city`
- `onlyFree`
- `page`
- `size`
- `sort` - price,asc or createdAt,desc or amount,desc
- `minPrice`
- `maxPrice`
- `categoryPublicId`
- `q`

---

## my

**GET** `/api/v1/waste/my`

### Query Parameters

- `page`
- `size`

---

## waste

**GET** `/api/v1/waste/8aa07d5c-6338-4bbd-8131-9f5f5201cc7b`

/api/v1/waste/{waste's public id}

---

## requestPhone

**POST** `/api/v1/waste/884ffa71-2724-4db9-854f-2c06bbdc5ffe/request-phone`

/api/v1/waste/8aa07d5c-6338-4bbd-8131-9f5f5201cc7b/request-phone

---

## all

**GET** `/api/v1/waste-categories`

---

## category

**GET** `/api/v1/waste-categories/4d8c32c8-6355-4545-b2c5-1ad69bfc0f08`

/api/v1/waste-categories/{waste's category public id}

---

## children

**GET** `/api/v1/waste-categories/4d8c32c8-6355-4545-b2c5-1ad69bfc0f08/children`

/api/v1/waste-categories/{waste's category public id}

---

## tree

**GET** `/api/v1/waste-categories/tree`

---

## all

**GET** `/api/v1/categories`

---

## category

**GET** `/api/v1/categories/0b2a1ef8-f4cf-466d-986d-5dfac862c95e`

---

## children

**GET** `/api/v1/categories/0b2a1ef8-f4cf-466d-986d-5dfac862c95e/children`

---

## tree

**GET** `/api/v1/categories/tree`

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
  "role": "CUSTOMER",
  "firstName": "Daniyar",
  "lastName": "Customer",
  "otpCode": "8366"
}
```

---

## 3. login

**POST** `/api/v1/auth/login`

### Headers

- `Content-Type`: application/json

### Request Body

```
{
    "login": "77714451775",
    "password": "qwerty111"
}

// {
//     "login": "77076770099",
//     "password": "qwerty123"
// }

```

---

## 4. refresh-token

**POST** `/api/v1/auth/refresh`

### Headers

- `Content-Type`: application/json

### Request Body

```json
{
  "refreshToken": "{{refreshToken}}"
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

## deleteAcc

**DELETE** `/api/v1/auth/account`

### Headers

- `Authorization`: Bearer YOUR_JWT_TOKEN

---

## createEstate

**POST** `/api/v1/estates`

### Request Body

```
{
    "kind" : "APARTMENT", // enum: APARTMENT, PRIVATE HOUSE, OFFICE
    "addressLine" : "Наурызбай батыра 26", // street name, hous number
    "city" : "Алматы", // Get list from "/api/v1/cities"
    "areaM2" : "49.9", // estate area
    "floor" : "7"
}
```

---

## update

**PUT** `/api/v1/estates`

### Request Body

```
{
    "publicId": "8cad34fc-f1f8-4d46-b5f0-28658b8b5788",
    "kind" : "APARTMENT", // enum: APARTMENT, PRIVATE HOUSE, OFFICE
    "addressLine" : "Наурызбай батыра 25", // street name, hous number
    "city" : "Алматы", // Get list from "/api/v1/cities"
    "areaM2" : "60", // estate area
    "floor" : "7"
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

**DELETE** `/api/v1/estates/6ac5bb6d-357c-4cd5-862e-76472a2ad9a2`

/api/v1/estates/{estate's public id}

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

```
{
    "category" : {
        "publicId" : "cb3c14da-bf53-4faa-8c43-e02c61525cca"
    },
    "realEstate" : {
        "publicId" : "8cad34fc-f1f8-4d46-b5f0-28658b8b5788"
    },
    "order" : {
        "description" : "Надо залить фундамент частного дома",
        "priceType" : "FIXED", // TWO types of price type "FIXED" and "NEGOTIABLE"
        "price" : 9000,
        "unit" : "areaM2"
    }
}
```

---

## update

**PUT** `/api/v1/orders`

### Request Body

```json
{
  "uuid": "8cad34fc-f1f8-4d46-b5f0-28658b8b5788",
  "description": "Надо залить фундамент частного дома",
  "priceType": "NEGOTIABLE",
  "unit": "areaM2"
}
```

---

## delete

**DELETE** `/api/v1/orders/84962dfb-2ecc-4bda-b8ad-f3d6623e6627`

/api/v1/orders/{order's uuid}

### Request Body

```json
{
  "mode": "raw",
  "raw": ""
}
```

---

## search

**GET** `/api/v1/orders`

This endpoint is dedicated for builder, so by requesting this url, builder can get all available orders

### Query Parameters

- `page`
- `size`
- `sort`
- `categoryPublicId`
- `priceFrom`
- `createdFrom`
- `createdTo`
- `city`
- `areaFrom`
- `q`
- `priceTo`
- `priceType` - FIXED/NEGOTIABLE

---

## customer

**GET** `/api/v1/orders/customer`

### Query Parameters

- `page`
- `size`
- `sort`

---

## requestPhone new

**POST** `/api/v1/orders/e81629c0-dbb2-48e7-a82a-830f70c7a8a3/request-phone`

/api/v1/orders/{order's uuid}/request-phone

### Request Body

```
{
    "offerPublicId" : "a602c426-5edb-41fd-b6f2-5695c1e93b52" // offer's public id
}

```

---

## send

**POST** `/api/v1/offers`

### Request Body

```json
{
  "order": {
    "uuid": "e81629c0-dbb2-48e7-a82a-830f70c7a8a3"
  },
  "offer": {
    "price": 1200,
    "priceType": "FIXED",
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

## updateOffer

**PUT** `/api/v1/offers/a602c426-5edb-41fd-b6f2-5695c1e93b52`

/api/v1/offers/{offer's public id}

### Request Body

```
{   
    "price": 1100,
    "unit": "m3",
    "daysEstimate": 3,
    "message": "Обновленное предложение"
}

//Можно только если статус = PENDING
```

---

## deleteOffer

**DELETE** `/api/v1/offers/a602c426-5edb-41fd-b6f2-5695c1e93b52`

/api/v1/offers/{offer's public id}

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

## getContractsById

**GET** `/api/v1/contracts/950ca334-887f-4cab-934f-05fe29e3974f`

---

## madeContractWithBuilder

**POST** `/api/v1/orders/e81629c0-dbb2-48e7-a82a-830f70c7a8a3/confirm-deal`

### Request Body

```
  {
    "offerPublicId": "a602c426-5edb-41fd-b6f2-5695c1e93b52", // offer's public id
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

## contractComplete

**POST** `/api/v1/contracts/950ca334-887f-4cab-934f-05fe29e3974f/complete`

/api/v1/contracts/{contract's public id}/complete

After job completion CUSTOMER SHOULD post this request. So after calling, order will maked as COMPLETE

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

**GET** `/api/v1/builders/9063cf0d-253d-42c6-a104-76bd6c68f4f6`

/api/v1/builders/{builder's public id}

---

## updateBuilder

**PUT** `/api/v1/builders/9063cf0d-253d-42c6-a104-76bd6c68f4f6`

/api/v1/builders/{builder's public id}

### Request Body

```json
{
  "password": null,
  "fullName": "Данияр строитель",
  "email": "daniyarslamkul@gmail.com",
  "phone": "77714451775",
  "avatarLink": "",
  "role": "BUILDER",
  "token": null,
  "login": null,
  "ratingAvg": 0,
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

**POST** `/api/v1/builders/9063cf0d-253d-42c6-a104-76bd6c68f4f6/category`

/api/v1/builders/{builder's public id}/category

### Request Body

```json
{
  "category": {
    "publicId": "9dfbe55a-96b7-4780-8810-a6b76508a59a"
  },
  "price": "1200",
  "description": "1 кубын куямыз осы акшага"
}
```

---

## category/delete

**DELETE** `/api/v1/builders/category/1`

---

## updateBuilderCategory

**PUT** `/api/v1/builders/category/2`

/api/v1/builders/category/{id from builder's price list}

updateBuilderCategory should be available from builder's profile page:

{id from builder's price list} is here:

{ "publicId": "9063cf0d-253d-42c6-a104-76bd6c68f4f6", "firstName": "Daniyar", "lastName": "BUILDER", "password": null, "fullName": "Данияр строитель", "email": "daniyarslamkul@gmail.com", "phone": "77714451775", "avatarLink": null, "role": "BUILDER", "token": null, "login": null, "ratingAvg": 0.00, "aboutMe": "Опытный электрик", "experienceYears": 10, "city": "Алматы", "district": "Besagash", "jobsDone": 15, "available": true, "priceList": \[ { "id": "4", "category": { "publicId": "9dfbe55a-96b7-4780-8810-a6b76508a59a", "slug": "foundation_strip", "name": "Ленточный фундамент", "nameKz": "Таспалы іргетас", "nameEng": null, "icon": "➰", "children": null, "parent": { "publicId": "64d265f4-89de-441c-b123-e1ebcdb999bd", "slug": "foundation", "name": "Фундамент", "nameKz": "Іргетас", "nameEng": null, "icon": "🏛️", "children": null, "parent": { "publicId": "0b2a1ef8-f4cf-466d-986d-5dfac862c95e", "slug": "construction", "name": "Строительные работы", "nameKz": "Құрылыс жұмыстары", "nameEng": null, "icon": "🏗️", "children": null, "parent": null } } }, "price": 1200.00, "description": "1 кубын куямыз осы акшага" } \]}

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
      "src": "postman-cloud:///1f0c065c-a91f-4b80-9a67-de18761db959"
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
      "src": [
        "postman-cloud:///1f0c0660-f83d-42e0-a6e5-c9a389e74462",
        "postman-cloud:///1f0c065f-ae9c-46a0-9583-c15457798312"
      ]
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
      "value": "e81629c0-dbb2-48e7-a82a-830f70c7a8a3",
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
      "src": "postman-cloud:///1f0c0666-bdc6-4b10-8e74-207718896e1b"
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

## postReviewOnBuildersJob

**POST** `/api/v1/reviews`

### Request Body

```
  {
    "contractPublicId": "950ca334-887f-4cab-934f-05fe29e3974f",
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

## getBuilderJobReviewList

**GET** `/api/v1/reviews/builder/9063cf0d-253d-42c6-a104-76bd6c68f4f6`

/api/v1/reviews/builder/{builder's public id}?page=0&size=10&sort

CUSTOMER can see detailed rating info of builder

### Query Parameters

- `page`
- `size`
- `sort`

---

## getBuilderJobReviewByReviewId

**GET** `/api/v1/reviews/51158ec4-f1db-4d46-ac4d-50db29404b18`

---

## getCities

**GET** `/api/v1/cities`

---

## major

**GET** `/api/v1/cities/major`

---

## city

**GET** `/api/v1/cities/2cab901a-53c6-4df1-bbb0-7bde057ab985`

{{shanyrak_url}}/api/v1/cities/{citiy's public id}

---

## createForAdmins

**POST** `/api/v1/cities`

### Request Body

```json
{
  "name": "Город",
  "nameKz": "Қала",
  "code": "city_code",
  "region": "Область",
  "regionKz": "Облыс",
  "isMajor": false,
  "sortOrder": 100
}
```

---

## updateForAdmin

**PUT** `/api/v1/cities/b86b4f63-75bd-44e4-8f30-2b323d67cf97`

### Request Body

```json
{
  "name": "Город",
  "nameKz": "Қала",
  "code": "city_code",
  "region": "Область",
  "regionKz": "Облыс",
  "isMajor": false,
  "sortOrder": 100
}
```

---

## deleteForAdmin

**DELETE** `/api/v1/cities/b86b4f63-75bd-44e4-8f30-2b323d67cf97`

---


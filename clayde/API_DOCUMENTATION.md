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

**GET** `/api/v1/categories/5414ea67-5f82-4514-82e9-61afe37234cf/children`

---

## login

**POST** `/api/v1/auth/login`

### Request Body

```json
{
  "mode": "urlencoded",
  "urlencoded": [
    {
      "key": "phone",
      "value": "87020000796",
      "type": "text"
    },
    {
      "key": "password",
      "value": "Beknur123!",
      "type": "text"
    }
  ]
}
```

---

## register

**POST** `/api/v1/auth/register`

### Request Body

```json
{
  "fullName": "Beknur Slamkul",
  "phone": "87020000796",
  "role": "CUSTOMER",
  "password": "Beknur123!"
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

## confrim

**POST** `/api/v1/contracts`

### Request Body

```json
{
  "offer": {
    "publicId": "963c906b-a174-4ed0-b64b-90a7bbb37d61"
  },
  "contract": {
    "totalPrice": 500000,
    "startDate": "2025-11-20",
    "endDate": "2025-11-25"
  }
}
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

**PUT** `/api/v1/builders/ceb3f0b3-3122-48d0-ba39-e256fe291d4b`

### Request Body

```json
{
  "password": null,
  "fullName": "Beknur Slamkul",
  "email": "beknurslamkulov@gmail.com",
  "phone": "87020000796",
  "avatarLink": "",
  "role": "BUILDER",
  "token": null,
  "login": "bekanur",
  "ratingAvg": 2,
  "aboutMe": "Мен мен едим мен едим",
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

**POST** `/api/v1/builders/ceb3f0b3-3122-48d0-ba39-e256fe291d4b/category`

### Request Body

```json
{
  "category": {
    "publicId": "5414ea67-5f82-4514-82e9-61afe37234cf"
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

**PUT** `/api/v1/builders/category/3`

### Request Body

```json
{
  "price": "1400",
  "description": "багасы котерилди"
}
```

---


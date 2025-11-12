---
title: 默认模块
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# 默认模块

Base URLs:

# Authentication

# 用户

## POST 登录

POST /api/user/login

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|username|query|string| 否 |user_id|
|password|query|string| 否 |密码|

> 返回示例

> 200 Response

```json
{
  "baseResponse": {
    "code": 0,
    "message": "string"
  },
  "user": {
    "user_id": 0,
    "username": "string",
    "is_admin": true,
    "score": 0,
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» baseResponse|object|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|true|none||none|
|» user|object|true|none||none|
|»» user_id|integer|true|none||none|
|»» username|string|true|none||none|
|»» is_admin|boolean|true|none||none|
|»» score|integer|true|none||none|
|»» created_at|string|true|none||none|
|»» updated_at|string|true|none||none|

## POST 注册

POST /api/user/register

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|username|query|string| 否 |user_id|
|password|query|string| 否 |密码|

> 返回示例

> 200 Response

```json
{
  "baseResponse": {
    "code": 0,
    "message": "string"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» baseResponse|object|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|true|none||none|

## POST 提供反馈

POST /api/user/feedback

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|consult_id|query|string| 否 |可选、传入则是对某次的咨询做反馈建议|
|content|query|string| 否 |反馈的意见|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# 购车决策

## GET 购车咨询

GET /api/consult/purchase

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|budget_range|query|string| 否 |预算范围|
|preferred_type|query|string| 否 |偏好车型|
|use_casecase|query|string| 否 |主要使用场景|
|fuel_type|query|string| 否 |燃料材料偏好|
|brand_preference|query|string| 否 |品牌偏好|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 查询咨询记录

GET /api/consult/query

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|consult_id|query|string| 否 |咨询记录id|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# 积分模块

## GET 查看用户积分

GET /api/score/user/query

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 兑换汽车周边

POST /api/score/gift/purchase

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|gitft_id|query|string| 否 |礼品Id|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 查看汽车周边

GET /api/score/gift/query

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# 管理员

## GET 查看所有咨询记录

GET /api/admin/consult/query

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 添加用户

POST /api/admin/user/add

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|query|string| 否 |user_id|
|password|query|string| 否 |密码|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## DELETE 删除用户

DELETE /api/admin/user/delete

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|id|query|string| 否 |user_id|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 查看用户反馈分析

GET /api/admin/feedback/query

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# 数据模型


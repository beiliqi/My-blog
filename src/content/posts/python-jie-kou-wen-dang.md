---
title: "python接口文档"
description: ""
date: 2025-07-02
updated: 2025-07-15
tags: []
draft: false
---
---

# 火车票查询服务 API 文档

**Base URL:** `http://127.0.0.1:7701`

---

## 1. 首页接口

### `GET /`

**描述：**<br>返回服务状态确认信息，测试接口

**响应示例：**

```json
"火车票查询服务API"
```

---

## 2. 实人认证（人脸识别）

### `POST /face_verification`

**描述：**<br>进行用户人脸识别验证，包含登录和自动核验

**请求体：**

```json
{
  "user_name": "***",
  "password": "20250610nba",
  "picture_path": "../trainappSpider/util/WechatIMG55.jpg", // 支持本地图片路径和http链接图片
  "scene_id": "10" // 10-登录核验  5-本人车票
}
```

**成功响应：**

```json
{
  "result": {
    "code": "0",
    "status": "success",
    "data": "用户***:登录成功",
    "user_id": "***_userid0"
  }
}
```

**失败响应：**

```json
{
  "code": "-1",
  "status": "error",
  "data": f"自动登录异常：{str(e)}",
}
```

---

## 3. 获取当前订单

### `GET /api/orders/current`

**描述：**<br>获取用户未出行订单列表。

**请求参数：**

- `user_id` （string） 必填，登录接口返回

**成功响应：**

```json
{
  "data": [
    {
      "arrive_date": "20250702",
      "arrive_time": "1909",
      "coach_name": "03",
      "ext_ticket_no": "4108762086070194294472025",
      "from_station_name": "六安",
      "from_station_telecode": "UAH",
      "order_date": "20250630125633",
      "passenger_name": "***",
      "seat_name": "07C号",
      "sequence_no": "E115309747",
      "start_time": "1845",
      "station_train_code": "D2208",
      "ticket_price": "16.00",
      "ticket_status_name": "已出站",
      "to_station_name": "合肥南",
      "to_station_telecode": "ENH",
      "train_date": "20250702"
    }
  ],
  "status": "success"
}
```

---

## 4. 获取历史订单

### `GET /api/orders/history`

需要账号重新解析

**描述：**<br>获取用户已完成的历史订单。

**请求参数：**

- `user_id` （string） 必填，登录接口返回

**成功响应：**

```json
{
  "code": "0",
  "data": {
    "error_msg": "",
    "orderList": [],
    "resultCode": null,
    "rtyStr": null,
    "succ_flag": "1",
    "verify_result": null
  },
  "status": "success"
}
```

---

## 5. 获取乘车人列表

### `GET /api/passengers`

**描述：**<br>查询用户绑定的乘车人信息。

**请求参数：**

- `user_id` （string） 必填，登录接口返回

**成功响应：**

```json
{
  "code": "0",
  "data": [
    {
      "id_no": "***",
      "id_type": "1",
      "is_user_self": "Y",
      "mobile_no": "***",
      "user_name": "***"
    },
    {
      "id_no": "***",
      "id_type": "1",
      "is_user_self": "N",
      "mobile_no": "***",
      "user_name": "***"
    }
    {
      "id_no": "***",
      "id_type": "B",
      "is_user_self": "N",
      "mobile_no": "***",
      "user_name": "***"
    }
  ],
  "status": "success"
}
```

---

## 6. 获取积分信息

### `GET /api/integration`

**描述：**<br>查询用户积分首页信息。

**请求参数：**

- `user_id` （string） 必填，登录接口返回

**成功响应：**

```json
{
  "data": [
    {
      "arrive_station_telecode": "HFH",
      "board_station_telecode": "AOH",
      "coach_no": "06",
      "cumulate_point": "1040",
      "member_id": "***",
      "point_use_total": "6000",
      "seat_no": "005D",
      "sequence_no": "E176159819",
      "station_train_code": "G7788",
      "ticket_price": 208.0,
      "trade_name": "乘车积分",
      "trade_time": "2025-06-02 01:58:22.362",
      "train_date": "20250529",
      "v_assignee_id_name": "***"
    },
    {
      "arrive_station_telecode": "AOH",
      "board_station_telecode": "ENH",
      "coach_no": "03",
      "cumulate_point": "1145",
      "member_id": "***",
      "point_use_total": "6000",
      "seat_no": "011D",
      "sequence_no": "E161768805",
      "station_train_code": "G1722",
      "ticket_price": 229.0,
      "trade_name": "乘车积分",
      "trade_time": "2025-05-31 02:08:29.282",
      "train_date": "20250527",
      "v_assignee_id_name": "***"
    },
    {
      "arrive_station_telecode": "ZHP",
      "board_station_telecode": "BXP",
      "coach_no": "07",
      "cumulate_point": "560",
      "member_id": "***",
      "point_use_total": "6000",
      "seat_no": "008C",
      "sequence_no": "E181606396",
      "station_train_code": "G335",
      "ticket_price": 112.0,
      "trade_name": "乘车积分",
      "trade_time": "2025-04-01 02:46:31.917",
      "train_date": "20250328",
      "v_assignee_id_name": "***"
    },
    {
      "arrive_station_telecode": "VNP",
      "board_station_telecode": "ENH",
      "coach_no": "10",
      "cumulate_point": "2215",
      "member_id": "***",
      "point_use_total": "6000",
      "seat_no": "016D",
      "sequence_no": "E134489986",
      "station_train_code": "G2564",
      "ticket_price": 443.0,
      "trade_name": "乘车积分",
      "trade_time": "2025-03-30 02:13:17.289",
      "train_date": "20250326",
      "v_assignee_id_name": "***"
    },
    {
      "arrive_station_telecode": "ENH",
      "board_station_telecode": "NKH",
      "coach_no": "08",
      "cumulate_point": "335",
      "member_id": "***",
      "point_use_total": "6000",
      "seat_no": "008C",
      "sequence_no": "E188770631",
      "station_train_code": "G7115",
      "ticket_price": 67.0,
      "trade_name": "乘车积分",
      "trade_time": "2025-03-20 02:23:12.481",
      "train_date": "20250316",
      "v_assignee_id_name": "***"
    },
    {
      "arrive_station_telecode": "NKH",
      "board_station_telecode": "ENH",
      "coach_no": "02",
      "cumulate_point": "335",
      "member_id": "***",
      "point_use_total": "6000",
      "seat_no": "017A",
      "sequence_no": "E158602554",
      "station_train_code": "D2374",
      "ticket_price": 67.0,
      "trade_name": "乘车积分",
      "trade_time": "2025-03-18 02:07:32.885",
      "train_date": "20250314",
      "v_assignee_id_name": "***"
    },
    {
      "arrive_station_telecode": "XNO",
      "board_station_telecode": "LAJ",
      "coach_no": "04",
      "cumulate_point": "290",
      "member_id": "***",
      "point_use_total": "6000",
      "seat_no": "3001",
      "sequence_no": "E109994847",
      "station_train_code": "D2649",
      "ticket_price": 58.0,
      "trade_name": "乘车积分",
      "trade_time": "2024-10-05 02:21:04.911",
      "train_date": "20241001",
      "v_assignee_id_name": "***"
    },
    {
      "arrive_station_telecode": "LAJ",
      "board_station_telecode": "ZJJ",
      "coach_no": "03",
      "cumulate_point": "80",
      "member_id": "***",
      "point_use_total": "6000",
      "seat_no": "011B",
      "sequence_no": "E103174206",
      "station_train_code": "C622",
      "ticket_price": 16.0,
      "trade_name": "乘车积分",
      "trade_time": "2024-10-04 02:24:13.083",
      "train_date": "20240930",
      "v_assignee_id_name": "***"
    }
  ],
  "status": "success"
}
```

---

## 7. 获取本人车票信息（异步）

### `GET /api/tickets/async`

**描述：**<br>异步方式获取当前用户车票信息。

**请求参数：**

- `user_id` （string） 必填，登录接口返回

**成功响应：**

```json
// 本人车票无数据
{
  "code": "0",
  "data": [],
  "status": "success"
}
// 本人车票有数据
{
  "code": "0",
  "data": [
    {
      "arrive_date": "20250713",
      "arrive_time": "06:07",
      "coach_name": "15",
      "ext_ticket_no": "2075066086070196049522025",
      "from_station_name": "郑州",
      "from_station_telecode": "ZZF",
      "passenger_name": "***",
      "seat_name": "105号",
      "seat_type_name": "硬座",
      "sequence_no": "E237466307",
      "start_time": "05:22",
      "station_train_code": "K1160",
      "ticket_price": 12.5,
      "ticket_status_name": "已支付",
      "to_station_name": "开封",
      "to_station_telecode": "KFF",
      "train_date": "20250713"
    },
    {
      "arrive_date": "20250714",
      "arrive_time": "06:45",
      "coach_name": "99",
      "ext_ticket_no": "1000166086070196597372025",
      "from_station_name": "北京",
      "from_station_telecode": "BJP",
      "passenger_name": "***",
      "seat_name": "无座",
      "seat_type_name": "二等座",
      "sequence_no": "E233706345",
      "start_time": "06:31",
      "station_train_code": "S110",
      "ticket_price": 4.0,
      "ticket_status_name": "已支付",
      "to_station_name": "北京西",
      "to_station_telecode": "BXP",
      "train_date": "20250714"
    },
    {
      "arrive_date": "20250714",
      "arrive_time": "07:59",
      "coach_name": "99",
      "ext_ticket_no": "1000166086070196597472025",
      "from_station_name": "北京",
      "from_station_telecode": "BJP",
      "passenger_name": "***",
      "seat_name": "无座",
      "seat_type_name": "二等座",
      "sequence_no": "E254377258",
      "start_time": "07:45",
      "station_train_code": "S102",
      "ticket_price": 4.0,
      "ticket_status_name": "已支付",
      "to_station_name": "北京西",
      "to_station_telecode": "BXP",
      "train_date": "20250714"
    },
    {
      "arrive_date": "20250703",
      "arrive_time": "06:45",
      "coach_name": "99",
      "ext_ticket_no": "1000166086062096229262025",
      "from_station_name": "北京",
      "from_station_telecode": "BJP",
      "passenger_name": "***",
      "seat_name": "无座",
      "seat_type_name": "二等座",
      "sequence_no": "E204366380",
      "start_time": "06:31",
      "station_train_code": "S110",
      "ticket_price": 4.0,
      "ticket_status_name": "已退票",
      "to_station_name": "北京西",
      "to_station_telecode": "BXP",
      "train_date": "20250703"
    }
  ],
  "status": "success"
}
```

---

## 通用错误响应格式

所有接口在失败时统一返回：

```json
{
  "code": "-1",
  "status": "error",
  "data": f"异常信息：{str(e)}",
}
```

---
title: "抓包明文示例"
description: ""
date: 2025-06-19
updated: 2025-06-30
tags: []
draft: false
---
## 1、登录接口

OperationType:com.cars.otsmobile.login

请求参数：

```plain
[{"_requestBody":{"baseDTO":{"check_code":"***","device_no":"***","h5_app_id":"60000004","h5_app_version":"5.9.0.37","hwv":"Nexus 6P","mobile_no":"***","os_type":"a","time_str":"20250611132218","user_name":"***","version_no":"5.9.0.8"},"dfpStr":"***","isPasswordCopy":false,"password":"@RMzd6YA8PRv2cszNbwZH1w==","riskSlideCode":"true","user_name":"***"}}]
```

响应结果:

```plain
{"age_group":"6","bind_str":"","born_date":"","check_id_flag":"0","country_code":"CHN","display_control_flag":"1","email":"***","error_msg":"","flag_msg":"","id_no":"***","id_no_show":"***","id_type_code":"1","integration_flag":"1","isDisable":"N","is_active":"Y","is_bind":"","is_receive":"Y","is_valid_pay":"N","last_msg":"欢迎使用铁路12306","lc_query_cipher":"o10oBMJf03C1VecrA8h9Z6uRwJ8m1F51jZqbVA%3D%3D","member_status":"0","mobileNo":"***","mobile_code":"***":"","notice_one_session":"Y","pic_control_flag":"","sex_code":"M","start_receive":"Y","succ_flag":"1","survey_encode_str":"","tk":"fBuzak-ol_vmbWHpNljcnM5qMT2zKpAo2z0","user_id":"10500041581019","user_name":"***","user_status":"1","user_type":"1"}
```

## 2、未出行订单

OperationType:com.cars.otsmobile.queryOrder

请求参数：

```plain
[{"_requestBody":{"baseDTO":{"check_code":"***","device_no":"***","h5_app_id":"60000003","h5_app_version":"5.9.0.24","hwv":"Nexus 6P","mobile_no":"***","os_type":"a","time_str":"20250611153803","user_name":"***","version_no":"5.9.0.8"},"from_reserve_date":"","from_train_date":"20250611","page_no":0,"passenger_id_no":"","passenger_id_type":"a","passenger_name":"","query_class":"2","rows_number":8,"seat_msg":"","sequence_no":"","status_flag":"","to_reserve_date":"","to_train_date":"20250810","train_code":""}}]
```

响应结果:

```plain
{"error_msg":"查询不到相关数据！","orderList":[],"succ_flag":"1"}

{"error_msg":"","orderList":[{"amount":"","cancel_flag":"N","confirm_flag":"N","gc_is_mix":"","has608Message":"","if_deliver":"N","insure_query_no":"","integral_pay_flag":"N","mix_new_old_diff":"0.00","mix_new_ticket_price_total":"0.00","myTicketList":[{"alertMsg":"","alternate_flag":"N","amount":"","arrive_date":"20250703","arrive_date_local":"20250703","arrive_time":"0645","arrive_time_local":"0645","batch_no":"1","cancel_flag":"N","carServiceType":"2","coach_name":"99","coach_no":"99","confirm_flag":"N","day_difference":"0","didiTimeStamp":"1751495460#1751496300","distance":"9","dw_flag":"0#0#N#N#","enc_no":"1b44acebbae493748d8ac569c702950fbecaf7986ce8ffb1a99459232b45b8b46f9b46a135256eae4e277b3f0478441b5dbd0ad3cf9034d5a3dbd5fcc3f26e9d","end_station_telecode":"BXP","eticket_flag":"Y","eticket_train_flag":"1","ext_ticket_no":"1000166086062096229262025","feature_label":"NN1NNNJ0N0Z1N0W1Z00aZ0     N00  000Z3Z      1FZZN00CHN0000010NN","flat_msg":"","from_station_name":"北京","from_station_telecode":"BJP","includeZtytCardRailwayLine":false,"integral_pay_flag":"N","invoice_state":"0","isShowDidiCar":"1","isShowStaticQRCode":"1","limit_time":"20250619142635","mix_new_ticket_price":"","mix_old_ticket_price":"","mix_return_fact":"","mix_return_rate":"","offline_return_date":"20251229","old_ticket_price":"","orgin_resign_info":"","passenger_age_group":"6","passenger_born_date":"19970327","passenger_id_no":"***","passenger_id_type_code":"1","passenger_id_type_name":"居民身份证","passenger_is_adult":"Y","pasr_is_old_than60":"N","passenger_is_real_adult":"Y","passenger_is_yong_than14":"N","passenger_name":"***","pay_limit_time":"20990101010101","pay_limit_time_rel":"2320568692","pay_mode":"","pay_mode_code":"Z","preference_rate":1.0,"preference_word":"","print_eticket_flag":"Y","purpose_code":"00","qrTypeFlag":"3","reserve_time":"20250619142635","resign_flag":"1","resign_info":"","resign_ticket_cost":"","resign_ticket_rate":"0.00","return_cost":"","return_fact":"","return_flag":"Y","return_total":"","seat_flag":"1","seat_name":"无座","seat_no":"3561","seat_type_code":"O","sequence_no":"E204366380","service2_label":"0","start_date_str":"20250703","start_station_telecode":"QEP",tart_time":"0631","start_time_local":"0631","start_train_code":"S110","station_train_code":"S110","syx_flag":"0","ticketAlertMsg":"您本次购买的车票是电子客票，无需换取纸质"4.00","ticket_status_code":"a","ticket_status_name":"已支付","ticket_type_code":"1","tipMsg":"","to_station_name":"北京西","to_station_telecode":"BXP","trade_mode":"J","to":"NNN1NNNJZF00aZ1  NNN0000ZZZ  0CHN00  ","train_date":"20250703","train_date_local":"20250703","trms_price_number":"","trms_price_rate":"","trms_service_code":""}],"order_date":"20250619142635","order_flag":"2","pay_flag":"N","pay_resign_flag":"N","pay_resign_type":"","petFlag":false,"print_eticket_flag":"Y","resign_flag":"1","resign_ticket_cost":"0.00","resign_ticket_rate":"0.00","return_cost":"","return_flag":"Y","return_rate":"","return_total":"","sequence_no":"E204366380","syx_flag":"0","ticket_price_all":"4.00","ticket_totalnum":"1"}],"succ_flag":"1"}
```

## 3、历史订单

OperationType:com.cars.otsmobile.queryHistoryOrder

请求参数：

```plain
[{"_requestBody":{"baseDTO":{"check_code":"***","device_no":"***","h5_app_id":"60000003","h5_app_version":"5.9.0.24","hwv":"Nexus 6P","mobile_no":"***","os_type":"a","time_str":"20250611153840","user_name":"***","version_no":"5.9.0.8"},"from_reserve_date":"","from_train_date":"20250512","page_no":0,"passenger_id_no":"","passenger_id_type":"a","passenger_name":"","query_class":"2","rows_number":8,"seat_msg":"","sequence_no":"","status_flag":"","to_reserve_date":"","to_train_date":"20250610","train_code":""}}]
```

响应结果:

```plain
{"error_msg":"","orderList":[],"succ_flag":"1"}
```

## 4、乘车人列表

OperationType:com.cars.otsmobile.queryPassenger

请求参数：

```plain
[{"_requestBody":{"baseDTO":{"check_code":"***","device_no":"***","h5_app_id":"60000001","h5_app_version":"5.9.0.70","hwv":"Nexus 6P","mobile_no":"***","os_type":"a","time_str":"20250611132226","user_name":"***","version_no":"5.9.0.8"},"queryVersion":"1"}}]
```

响应结果:

```plain
{"error_msg":"","isVerifyMobile":"N","passengerResult":[{"born_date":"19970327","country_code":"CHN","email":"***","enc_no":"1b44acebbae493748d8ac569c702950fda7b25f1e48d65f4528b0713b32169a6713fd15ef33a249556695c751f932548dfe03bad293e75d7a798e4d83f2cf9f2f08a68071ccd703aa59438af82d0476aa8945705a3ccf241e5577740c4dc4d23","first_letter":"DXG","id_no":"***","id_type":"1","if_receive":"Y","is_active":"Y","is_adult":"Y","is_buy_ticket":"N","is_loster":"N","is_old_than60":"N","is_smoker":"N","is_user_self":"Y","is_yong_than14":"N","mobile_code":"***","mobile_no":"***","other_totaltimes":"91#93#98#99#95#97","p_str":"","passenger_uuid":"9b93ffc45910d2089be0b4cf27357aa97486e6294db51735878b2fd4769f4782","phone_no":"","sex_code":"M","total_times":"99","two_totaltimes":"93#95#97#99","user_name":"***","user_type":"1","valiate_end":""}],"succ_flag":"1"}
```

## 5、铁路会员

OperationType:com.cars.otsmobile.memberInfo.integrationHomeInit

请求参数：

```plain
[{"_requestBody":{"baseDTO":{"check_code":"***","device_no":"***","h5_app_id":"60000007","h5_app_version":"5.9.0.9","hwv":"Nexus 6P","mobile_no":"***","os_type":"a","time_str":"20250611153948","user_name":"***","version_no":"5.9.0.8"},"checkowFlag":"Y","owversion":"5.9.0.8","station":"1","version":"1"}}]
```

响应结果:

```plain
{"couponNum":"0","error_msg":"","idFlag":"0","memberPoints":{"flag3":"1","level_start_date":"20230106","level_stop_date":"23001231","member_id":"***","member_level":"2","member_level_diff":"44844","member_level_point":"5156","month_cancel_point":"1545","month_consume_point":"0","point_list":"","point_stop_date":"20251012","point_type_list":"","point_use_total":"5156","service_cancel_point":"0","service_use_point":"0","three_month_cancel_point":"0"},"mobile_code":"***","msgList":[],"succ_flag":"1","userContact":"***","userMemberStatus":"3","userRealName":"***"}
```

## 6、乘车积分

OperationType:com.cars.otsmobile.memberInfo.pointSimpleQuery

请求参数：

```plain
[{"_requestBody":{"baseDTO":{"check_code":"***","device_no":"***","h5_app_id":"60000007","h5_app_version":"5.9.0.9","hwv":"Nexus 6P","mobile_no":"***","os_type":"a","time_str":"20250611154035","user_name":"***","version_no":"5.9.0.8"},"consume_type":"*","member_id":"","page_no":"1","page_num":"100","point_status":"0","query_type":"0","sort_flag":"B","start_date":"20240611","stop_date":"20250611"}}]
```

响应结果:

```plain
{"error_msg":"","point_list":[{"consume_point":"0","cumulate_point":"355","error_code":"1","error_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":"","flag5":"","f":"","member_id":"***","product_price":"710","record_sum":"12","sequence_no":"","start_date":"20250509","stop_date":"20260509","trade_flag":"1","trade_id":"1808966869330402250506092538","trade_name":"乘车积分","trade_time":"2025-05-09 01:09:40.71","trade_type":"t","train_code":"G206","train_date":"20250505"},{"consume_point":"0","cate_point":"1675","error_code":"1","error_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":"","flag5":"","flag6":"","member_id":"***","product_price":"335record_sum":"12","sequence_no":"","start_date":"20250507","stop_date":"20260507","trade_flag":"1","trade_id":"1001066869026105250503134433","trade_name":"乘车积分","trade_":"2025-05-07 01:07:34.25","trade_type":"t","train_code":"G201","train_date":"20250503"},{"consume_point":"0","cumulate_point":"223","error_code":"1","error_msg":"查询成功lag1":"","flag2":"","flag3":"","flag4":"","flag5":"","flag6":"","member_id":"***","product_price":"445","record_sum":"12","sequence_no":"","start_date":"20250424","stop_date":"20260424","trade_flag":"1","trade_id":"1000466869015444250419195914","trade_name":"乘车积分","trade_time":"2025-04-24 01:34:39.799","trade_type":"t","train_c:"C2001","train_date":"20250420"},{"consume_point":"0","cumulate_point":"273","error_code":"1","error_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":"","flag5":"lag6":"","member_id":"***","product_price":"545","record_sum":"12","sequence_no":"","start_date":"20250424","stop_date":"20260424","trade_flag":"1","trade_id":"1015766869996405250421165011","trade_name":"乘车积分","trade_time":"2025-04-24 01:34:39.799","trade_type":"t","train_code":"C2270","train_date":"20250420"},{"consume_point":"cumulate_point":"490","error_code":"1","error_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":"","flag5":"","flag6":"","member_id":"***","product_price":"980","record_sum":"12","sequence_no":"","start_date":"20250208","stop_date":"20260208","trade_flag":"1","trade_id":"3873866869360886250122150053","trade_name":"乘车积分"ade_time":"2025-02-08 01:27:53.069","trade_type":"t","train_code":"K1306","train_date":"20250204"},{"consume_point":"0","cumulate_point":"575","error_code":"1","error_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":"","flag5":"","flag6":"","member_id":"***","product_price":"1150","record_sum":"12","sequence_no":"","start_d:"20250131","stop_date":"20260131","trade_flag":"1","trade_id":"1002566869157488250114083419","trade_name":"乘车积分","trade_time":"2025-01-31 01:28:15.269","trade_type":"train_code":"K1305","train_date":"20250127"},{"consume_point":"0","cumulate_point":"20","error_code":"1","error_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":""ag5":"","flag6":"","member_id":"***","product_price":"40","record_sum":"12","sequence_no":"","start_date":"20241013","stop_date":"20251013","trade_flag":"1","trade_id":"1000168869589739240927160524","trade_name":"乘车积分","trade_time":"2024-10-13 01:27:52.251","trade_type":"t","train_code":"S102","train_date":"20241009"},{"consument":"0","cumulate_point":"1545","error_code":"1","error_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":"","flag5":"","flag6":"","member_id":"***","produrice":"3090","record_sum":"12","sequence_no":"","start_date":"20241012","stop_date":"20251012","trade_flag":"1","trade_id":"6577366869998956241003043547","trade_name":"乘车分","trade_time":"2024-10-12 01:30:21.334","trade_type":"t","train_code":"G422","train_date":"20241008"},{"consume_point":"400","cumulate_point":"0","error_code":"1","erro_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":"","flag5":"","flag6":"","member_id":"***","product_price":"","record_sum":"12","sequence_no":"E27939498start_date":"","stop_date":"","trade_flag":"2","trade_id":"ST013230210306240923191409808","trade_name":"兑换车票","trade_time":"2024-09-23 19:14:09.807099","trade_type":"ttrain_code":"S110","train_date":"20241006"},{"consume_point":"400","cumulate_point":"0","error_code":"1","error_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":""ag5":"","flag6":"","member_id":"***","product_price":"","record_sum":"12","sequence_no":"E265729027","start_date":"","stop_date":"","trade_flag":"2","trade_id":"ST010816402647240919143033318","trade_name":"兑换车票","trade_time":"2024-09-19 14:30:33.317173","trade_type":"tc","train_code":"S110","train_date":"20241003"},{"consume_po:"1000","cumulate_point":"0","error_code":"1","error_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":"","flag5":"","flag6":"","member_id":"***","product_e":"","record_sum":"12","sequence_no":"E225397575","start_date":"","stop_date":"","trade_flag":"2","trade_id":"ST010902124341240918154532256","trade_name":"兑换车票","tradme":"2024-09-18 15:45:32.255651","trade_type":"tc","train_code":"G3694","train_date":"20240929"},{"consume_point":"400","cumulate_point":"0","error_code":"1","error_msg":"查询成功","flag1":"","flag2":"","flag3":"","flag4":"","flag5":"","flag6":"","member_id":"***","product_price":"","record_sum":"12","sequence_no":"E258992329","staate":"","stop_date":"","trade_flag":"2","trade_id":"ST017104126103240918144306038","trade_name":"兑换车票","trade_time":"2024-09-18 14:43:06.037403","trade_type":"tc","traode":"S110","train_date":"20241001"}],"succ_flag":"1"}
```

## 7、积分明细

OperationType:com.cars.otsmobile.memberInfo.pointDetailQuery

请求参数：

```plain
[{"_requestBody":{"baseDTO":{"check_code":"***","device_no":"***","h5_app_id":"60000007","h5_app_version":"5.9.0.9","hwv":"Nexus 6P","mobile_no":"***","os_type":"a","time_str":"20250611154138","user_name":"***","version_no":"5.9.0.8"},"query_type":"t","trade_id":"1808966869330402250506092538"}}]
```

响应结果:

```plain
{"error_msg":"","point_list":[{"arrive_station_name":"","arrive_station_telecode":"WJK","board_station_name":"","board_station_telecode":"QDK","coach_no":"10","error_code":"1","error_msg":"查询成功!","flag1":"","flag2":"","flag3":"","flag4":"","flag5":"","flag6":"","member_id":"***","query_type":"t","record_sum":"1","resign_arrive_ion_name":"","resign_arrive_station_telecode":"","resign_board_station_name":"","resign_board_station_telecode":"","resign_coach_no":"","resign_point_diff":"","resign_point_fee":"","resign_seat_no":"","resign_seat_type_code":"","resign_station_train_code":"","resign_train_date":"","seat_no":"003F","seat_type_code":"O","sequence_no":"E251556729","station_train_code":"G206","ticket_price":"710","trade_date":"20250509","trade_id":"1808966869330402250506092538","trade_point":"355","train_date":"20250505","v_assignee_id_name":"***","v_assignee_id_no":"","v_assignee_id_type":"1"}],"succ_flag":"1"}
```

## 8、本人车票

OperationType:com.cars.otsmobile.psr.queryAsync

请求参数：

```plain
[{"_requestBody":{"baseDTO":{"check_code":"***","device_no":"***","h5_app_id":"60000002","h5_app_version":"5.9.0.18","mobile_no":"***","os_type":"a","time_str":"20250611154306","user_name":"***","version_no":"5.9.0.8"},"bizId":"2025061020502638515D41D8CD98F00B204E9800998ECF8427E52917301930052516BE5C721BF8A748719949A8B18D0FAF16","dfpStr":"","end_date":"","from_date":"","pageIndex":1,"pageSize":10,"sceneId":"5","ticket_type":"1","zimId":"tky20250610205026388"}}]
```

响应结果:

```plain
{"verify_result":{"auth_type":"0","verify_error_code":"","resultData":{},"auth_count":0,"verify_error_msg":"","auth_flag":"0"},"error_msg":"","succ_flag":"1","psrOrders":[{"ticket_type":"1","ticket_state":"4","sale_label":"","orderType":"2","offline_return_date":"20251124","board_train_code":"G7788","student_valid_flag":"Z","print_receipt_flag":"N","arrive_date":"20250529","eticket_train_flag":"1","invoice_state":"2","tipMsg":"","syx_flag":"0","integral_pay_flag":"N","insure_label":"0","from_bureau_code":"H","from_tele_code":"AOH","coach_no":"06","train_date":"20250529","passenger_born_date":"19911022","end_tele_code":"JKU","ticket_price":"2080","orgin_resign_info":"","check_out_time":"","card_check_time":"","service2_label":"0","check_label":"","ext_ticket_no":"6610062086052693771712025","to_station_pycode":"Hefei","preference_word":"9.1折","id_name":"居民身份证","arrive_time":"20:47","resign_info":"","start_time":"18:24","seat_name":"05D号","reserver_phone":"***","start_tele_code":"AOH","to_station_name":"合肥","to_tele_code":"HFH","trade_no":"1E176159819001001205749606","to_bureau_code":"H","feature_label":"NN1NNNJ0N0Y1N0W1Z00aZ0   00N00  000Z3Z 88Y003FZZN00CHN0000010NN","from_station_name":"上海虹桥","seat_type_name":"二等座","coach_name":"06","status_code":"j","check_in_time":"","receipt_count":"0","enc_no":"c7bbabc67be6777d8a161fbf64352f08d555c70e8071ad3c3902a4c31ca175c469a3f585b3c3db19e980e97fa4f3dfc511ff12e3403f66066702d8bd95a6a1b1afeb7e6b2b6e55dee335798194bbfde7dee4af3f0947645264e03dea190d5e32","crm_label":"0","train_no":"5l000G778820","train_code":"G7788","passenger_phone":"","start_date":"2025-05-29","passenger_id_type":"1","batch_no":"1","sale_mode":"G","status_name":"已出站","seat_no":"005D","seat_type_code":"O","express_label":"","passenger_name":"***","sale_mode_type":"1","food_label":"","if_cash":"N","passenger_id_no":"***","dw_flag":"0#0#N#N#","login_name":"","ticket_type_name":"成","resign_flag":"4","return_flag":"N","preference_rate":-0.092,"local_arrive_time":"202505292047","from_station_pycode":"Shanghaihongqiao","local_start_time":"202505291824","sequence_no":"E176159819"},{"ticket_type":"1","ticket_state":"4","sale_label":"","orderType":"2","offline_return_date":"20251122","board_train_code":"G1722","student_valid_flag":"Z","print_receipt_flag":"N","arrive_date":"20250527","eticket_train_flag":"1","invoice_state":"2","tipMsg":"","syx_flag":"0","integral_pay_flag":"N","insure_label":"0","from_bureau_code":"H","from_tele_code":"ENH","coach_no":"03","train_date":"20250527","passenger_born_date":"19911022","end_tele_code":"AOH","ticket_price":"2290","orgin_resign_info":"","check_out_time":"","card_check_time":"","service2_label":"0","check_label":"","ext_ticket_no":"1942362086052099569372025","to_station_pycode":"Shanghaihongqiao","preference_word":"","id_name":"居民身份证","arrive_time":"11:30","resign_info":"","start_time":"09:36","seat_name":"11D号","reserver_phone":"***","start_tele_code":"WHN","to_station_name":"上海虹桥","to_tele_code":"AOH","trade_no":"1E161768805001001180740206","to_bureau_code":"H","feature_label":"NN1NNNJ0N0Y1N0W1Z00aZ0   00N00  000Z3Z 88Y003FZZN00CHN0000010NN","from_station_name":"合肥南","seat_type_name":"二等座","coach_name":"03","status_code":"j","check_in_time":"","receipt_count":"0","enc_no":"c7bbabc67be6777d8a161fbf64352f08d555c70e8071ad3c3902a4c31ca175c469a3f585b3c3db19e980e97fa4f3dfc511ff12e3403f66066702d8bd95a6a1b1afeb7e6b2b6e55dee335798194bbfde7dee4af3f0947645264e03dea190d5e32","crm_label":"0","train_no":"4e000G172207","train_code":"G1722","passenger_phone":"","start_date":"2025-05-27","passenger_id_type":"1","batch_no":"1","sale_mode":"G","status_name":"已出站","seat_no":"011D","seat_type_code":"O","express_label":"","passenger_name":"***","sale_mode_type":"1","food_label":"","if_cash":"N","passenger_id_no":"***","dw_flag":"0#0#N#N#","login_name":"","ticket_type_name":"成","resign_flag":"4","return_flag":"N","preference_rate":1.0,"local_arrive_time":"202505271130","from_station_pycode":"Hefeinan","local_start_time":"202505270936","sequence_no":"E161768805"}],"totalOrders":"2"}
```

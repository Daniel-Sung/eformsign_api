let document_option_create = {
  "document": {
    //"document_name": "",
    //"select_group_name": "",
    //"notification": [],
    //"comment": "",
    "recipients": [
      {
        "step_type": "05",  // 00:시작, 05:참여자, 06:검토자
        "use_mail": true,
        "use_sms": true,
        "member": {
          "name": "",
          "id": "",
          "sms": {
              "country_code": "+82",
              "phone_number": ""
          }
        },
        "auth": {
          "password": "",
          "password_hint": "",
          "valid": {
              "day": 7,
              "hour": 0
          }
        }
      }
    ],
    "fields": [],
    "parameters": [
      {
          "id": "jsonDataset",
          "value": ""
      }
    ]
  }
};

let document_option_create_external = {
  "document": {
    //"document_name": "개인정보제공동의서",
    //"comment": "동의합니다.",
    "recipients": [
      {
        "step_type": "01",
        "use_mail": true,
        "use_sms": true,
        "member": {
          "name": "",
          "id": "",
          "sms": {
            "country_code": "+82",
            "phone_number": ""
          }
        }
      }
    ],
    "select_group_name": "",
    "send_external_pdf": {
      "email": "",
      "sms": {
        "country_code": "+82",
        "phone_number": ""
      },
      "auth": {
        "password": "",
        "password_hint": "."
      }
    },
    "fields": [],
    "parameters": [
      {
          "id": "jsonDataset",
          "value": ""
      }
    ]
  }
}
let document_option_create_embedapi = {
  "company": {
      "id": localStorage.company_id,
      "country_code": "jp"
  },
  "user": {
      "type": "01",
      "id": localStorage.memberId,
	  //"access_token" : "", 
      //"refresh_token" : ""
	  
      "access_token" : localStorage.access_token, 
      "refresh_token" : localStorage.refresh_token
	  
  },
  "mode": {
    "type" : "01",  // 01 : 文書作成 , 02 : 문서 처리 , 03 : 미리 보기 
    "template_id" : localStorage.templateId
  },
  "layout" : {
    "lang_code" : "ja",  
    "header" : false, 
    "footer" : false 
  },
  "prefill": {
    "document_name": "",
    "fields": [],
    "recipients": [
      {
        /*
		"step_type": "05",  // 00:시작, 05:참여자, 06:검토자
        "step_idx" : "2",
        "use_mail": true,
        "use_sms": true,
        "name": localStorage.recipientName,
        "id": localStorage.recipientEmail,
        "sms": localStorage.recipientMobile,
        "auth": {
          "password": "",
          "password_hint": "",
          "valid": {
              "day": 7,
              "hour": 0
          }
        }
		*/
      }
    ],
  },
  "form_parameters":[{
        "name" : "jsonDataset",
        "value" : ""
    }
  ],
};
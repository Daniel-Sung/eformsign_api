let document_option_preview = {
  "company": {
    "id": localStorage.company_id,
    "country_code": "jp"
  },
  "user": {
    "type": "01", // 01: 내부 사용자, 02: 외부 사용자
    "id": localStorage.memberId,
    "access_token" : localStorage.access_token, 
    "refresh_token" : localStorage.refresh_token
  },
  "mode": {
    "type" : "03", // 01 : 文書作成 , 02 : 문서 처리 , 03 : 미리 보기 
    "template_id" : localStorage.templateId,
    "document_id" : localStorage.documentId
  },
    "layout" : {
    "lang_code" : "ja", 
    "header" : false, 
    "footer" : false 
  },
};
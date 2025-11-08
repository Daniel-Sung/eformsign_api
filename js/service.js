const home = 'http://apijp.eformsign.io';
const reqDomain = home + ':8000';
const apiUrl = reqDomain + "/api";
const downPath = home+'/download/apidemo';
let menuItem;
let recipientName, recipientEmail, recipientMobile, recipientData;
let massData;
// 4010004 (token expired)
async function reqAccessToken(){
	if(localStorage.getItem("access_token")) return true;
	let reqUrl = apiUrl + "/api_auth/access_token?memberId="+localStorage.memberId;
	console.log("\nRequest: Accress Token>\n" + reqUrl);
	const response = await fetch(reqUrl)
	.catch(error => {
		document.getElementById("message").innerHTML =error;
		return false;
    });
	const json = await response.json()
	.catch(error => {
		document.getElementById("message").innerHTML =error;
		return false;
    });
	if (json.code > 200) {
		document.getElementById("message").innerHTML = json.ErrorMessage;
		return false;
	} else {
		localStorage.setItem('access_token', json.oauth_token.access_token);
		localStorage.setItem('refresh_token', json.oauth_token.refresh_token);
		localStorage.setItem('company_id', json.api_key.company.company_id);
		document.getElementById("message").innerHTML = resource[localStorage.lang].SVC_TOKEN_RECEIVED;
		console.log(json);
		return true;
	}
}

async function reqRefreshToken(){
	let reqUrl = apiUrl + "/api_auth/refresh_token?accessToken="+localStorage.access_token+"&refreshToken="+localStorage.refresh_token;
	console.log("Request: Refresh Token>\n"+reqUrl);
	await fetch(reqUrl)
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
			document.getElementById("message").innerHTML = data.ErrorMessage;
            return false;
        }
		localStorage.setItem('access_token', data.oauth_token.access_token);
		localStorage.setItem('refresh_token', data.oauth_token.refresh_token);
		document.getElementById("message").innerHTML = resource[localStorage.lang].SVC_TOKEN_REFRESHED;
		console.log(data);
		return true;
    })
    .catch(error => {
		document.getElementById("message").innerHTML =error;
		return false;
    });
}

async function getTemplateList(){
	reqAccessToken().then((res) => {
		if (res) {
			reqGetTemplateList();
		} 
	})
}

function reqGetTemplateList(){
	const reqUrl = apiUrl + "/get/forms/";
	console.log("\nRequest: template list>\n" + reqUrl);
	fetch(reqUrl, {
		headers: {
			'Content-type': 'application/json',
			'Authorization': localStorage.getItem('access_token')
		}
	})
	.then((response) => response.json())
	.then((json) => {
		//console.log(json);
		if (json.code && (json.code!="-1")) {
			document.getElementById("message").innerHTML = json.ErrorMessage;
			if(json.code == "4010001" || json.code == "4010004") {
				localStorage.removeItem("access_token");
				getTemplateList();
			}
			return;
		}
		let templateArray = new Array();
		for(let i in json.templates){			
			if(json.templates[i].category == "Demo" && json.templates[i].enabled == true) templateArray.push(json.templates[i]);
				//console.log("tid : "+json.templates[i].form_id+", category : "+json.templates[i].category);			
				
		}
		console.log(templateArray);
		document.getElementById("message").innerHTML = resource[localStorage.lang].SVC_TEMPLATE_LIST_RECEIVED + "(" + templateArray.length +")";
		caseSensitiveFilter = function (value, searchStr) {
			return value.indexOf(searchStr) > -1;
		};		
		
		
		let grid = $('#grid').grid({
			dataSource: templateArray,
			//dataSource: json.templates,
			columns: [
				{ field: 'category', title: resource[localStorage.lang].SVC_TEMPLATE_LIST_CATEGORY , sortable: true, width:120 },
				{ field: 'name', title: resource[localStorage.lang].SVC_TEMPLATE_LIST_NAME, sortable: true, width:190  },
				{ field: 'update_name', title: resource[localStorage.lang].SVC_TEMPLATE_LIST_UPDATOR, sortable: true, width:110  },
				{ field: 'update_date', title: resource[localStorage.lang].SVC_TEMPLATE_LIST_UPDATED, type: 'date', sortable: true, width:110  },
				//{ field: 'version', title: resource[localStorage.lang].SVC_TEMPLATE_LIST_VERSION, sortable: true, width:60  },
				//{ field: 'enabled', title: resource[localStorage.lang].SVC_TEMPLATE_LIST_ENABLED, sortable: true, width:60, renderer: function (value, record) { return (value == true) ? '<span style="color:blue">Y</span>' : '<span style="color:red">N</span>'; } },
				{ field: 'desc', title: resource[localStorage.lang].SVC_TEMPLATE_LIST_DESC, sortable: true, width:300 }
			],
			resizableColumns: true,
			selectionMethod: 'checkbox',
			pager: { limit: 10 }
			//fixedHeader: true
		});
		grid.on('rowSelect', function (e, $row, id, record) {
            localStorage.setItem("templateId", record.form_id);
			localStorage.setItem("templateName", record.name);
		});
		$('#btnSearchCategory').on('click', function () {
			grid.reload({ category: $('#categoryStr').val() });
		});
		$('#btnSearchTemplate').on('click', function () {
			grid.reload({ name: $('#templateStr').val() });
		});
		$('#btnSearchDesc').on('click', function () {
			grid.reload({ desc: $('#descStr').val() });
		});
	});
}

const from = new Date();
let to = new Date();
to.setDate(to.getDate() - 30);
let documentBox = {type: "", title_and_content: "", title: "",  content: "", start_create_date: from.getTime(), end_create_date: to.getTime(), limit: "200",  skip: "0"};
function reqGetDocumentList(type,templateId,keyword){
	let docBoxId = localStorage.docBoxId;
	let db = documentBox;
	db.type = type;
	if (keyword) db.title_and_content = keyword;
	if (templateId) db.template_ids = [templateId];
	document.getElementById("message").innerHTML = resource[localStorage.lang].SVC_DOC_LIST_RECEIVING;
	const docBox = JSON.stringify(db);
	let reqUrl = apiUrl + "/get/documents?docBox="+ encodeURI(docBox,"UTF-8");
	console.log("Request: Document list>\n" + reqUrl);
	let doc = '[';
	fetch(reqUrl, {
		headers: {
			'Content-type': 'application/json',
			'Authorization': localStorage.getItem('access_token')
		}
	})
	.then((response) => response.json())
	.then((json) => {
		console.log(json);
		if(json.code == "4010001" || json.code == "4010004" || json.code == "4030009") {
			document.getElementById("message").innerHTML = json.ErrorMessage;
			return;
		}
		let data = json.documents;
		let obj = JSON.parse(JSON.stringify(data));
		for (i in data){
			//console.log(obj[i].current_status.step_recipients[0].id);
			doc += "{";
			doc += "\"docid\":\""+obj[i].id+"\",";
			doc += "\"docname\":\""+obj[i].document_name+"\",";
			doc += "\"tid\":\""+obj[i].template.id+"\",";
			doc += "\"tname\":\""+obj[i].template.name+"\",";
			doc += "\"creator\":\""+obj[i].creator.name+"\",";
			doc += "\"createdate\":"+obj[i].created_date+",";
			doc += "\"stepname\":\""+obj[i].current_status.step_name+"\",";
 			if (docBoxId == '01' || docBoxId == '02') {
				doc += "\"recipient\":\""+obj[i].current_status.step_recipients[0].name+"\",";
				if (obj[i].current_status.step_recipients[0].email == undefined) {
					doc += "\"recipientid\":\""+obj[i].current_status.step_recipients[0].id +"\"";
				} else {
					doc += "\"recipientid\":\""+obj[i].current_status.step_recipients[0].email +"\"";
				}
			} else {
				doc += "\"lasteditor\":\""+obj[i].last_editor.name+"\",";
				doc += "\"lasteditorid\":\""+obj[i].last_editor.id+"\",";
				doc += "\"lastedited\":"+obj[i].updated_date;
			}
			doc += "},";
		}
		doc += ']';
		doc = doc.replace(",]", "]");
		doc = JSON.parse(doc);
		let grid;
		if (docBoxId == '01' || docBoxId == '02') {
			grid = $('#grid').grid({
				dataSource: doc,
				columns: [
					{ field: 'tid', title: 'tid', sortable: true, hidden: true},
					{ field: 'tname', title: resource[localStorage.lang].SVC_DOC_LIST_TEMPLATE, sortable: true, width:200 },
					{ field: 'docid', title: 'did', sortable: true, hidden: true},
					{ field: 'docname', title: resource[localStorage.lang].SVC_DOC_LIST_DOCUMENT, sortable: true, width:230 },
					{ field: 'stepname', title: resource[localStorage.lang].SVC_DOC_LIST_STEP, sortable: true, width:120 },
					{ field: 'creator', title: resource[localStorage.lang].SVC_DOC_LIST_CREATOR, sortable: true, width:100 },
					{ field: 'createdate', title: resource[localStorage.lang].SVC_DOC_LIST_CREATED, sortable: true, type: 'date', format: 'yyyy/mm/dd HH:MM:ss', width:120 },
					{ field: 'recipient', title: 'Recipient', sortable: true, width:100 },
					{ field: 'recipientid', title: 'email', sortable: true, width:150 }
				],
				resizableColumns: true,
				selectionMethod: 'checkbox',
				pager: { limit: 10 }
				//fixedHeader: true
			});
		} else {
			grid = $('#grid').grid({
				dataSource: doc,
				columns: [
					{ field: 'tid', title: 'tid', sortable: true, hidden: true},
					{ field: 'tname', title: resource[localStorage.lang].SVC_DOC_LIST_TEMPLATE, sortable: true, width:200 },
					{ field: 'docid', title: 'did', sortable: true, hidden: true},
					{ field: 'docname', title: resource[localStorage.lang].SVC_DOC_LIST_DOCUMENT, sortable: true, width:230 },
					{ field: 'stepname', title: resource[localStorage.lang].SVC_DOC_LIST_STEP, sortable: true, width:120 },
					{ field: 'creator', title: resource[localStorage.lang].SVC_DOC_LIST_CREATOR, sortable: true, width:100 },
					{ field: 'createdate', title: resource[localStorage.lang].SVC_DOC_LIST_CREATED, sortable: true, type: 'date', format: 'yyyy/mm/dd HH:MM:ss', width:120 },
					{ field: 'lasteditor', title: resource[localStorage.lang].SVC_DOC_LIST_LAST_UPDATER, sortable: true, width:100 },
					{ field: 'lastedited', title: resource[localStorage.lang].SVC_DOC_LIST_LAST_UPDATED, sortable: true, type: 'date', format: 'yyyy/mm/dd HH:MM:ss', width:120 }
				],
				resizableColumns: true,
				selectionMethod: 'checkbox',
				pager: { limit: 10 }
				//fixedHeader: true
			});
		}
		grid.on('rowSelect', function (e, $row, id, record) {
			localStorage.setItem("templateId",record.tid);
			localStorage.setItem("templateName",record.tname);
			localStorage.setItem("documentId",record.docid);
			localStorage.setItem("documentName",record.docname);
			if (menuItem === "complete-list"){
				previewDocument();
			}
		});
		$('#btnRemove').on('click', function () {
			grid.destroy();
			document.getElementById("btnRemove").style.display = "hidden";
		});
        document.getElementById("message").innerHTML =  resource[localStorage.lang].SVC_DOC_LIST_RECEIVED + " (" + json.total_rows +")";
    });
}

let cancelDoc = {"input": {"document_ids" : [""],"comment" : ""}};
function reqCancelDocument(documentId){
	cancelDoc.input.document_ids[0] = documentId;
	const body = JSON.stringify(cancelDoc);
	console.log("Request: Cancel Document>\n" + body);
	let reqUrl = apiUrl + "/post/documents/cancel";
	console.log(reqUrl);
	fetch(reqUrl, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
			'Authorization': localStorage.getItem('access_token')
		},
		body: body
	})
	.then((response) => response.json())
	.then((json) => {
		console.log(json);
		if(json.result.fail_result.length) {
			document.getElementById("message").innerHTML = JSON.stringify(json.result.fail_result);
		}
	})
}

function getRecipientList() {
    const url = "/view/recipient-list.html";
    console.log(url);
    window.open(url, "_self");
}

function getCompleteList(){
    const url = "/view/complete-list.html";
    console.log(url);
    window.open(url, "_self");
}

function createDocument() {
	let url = "/embed-html/"+localStorage.templateId+".html";
	fetch(url).then((response) => {
		if (!response.ok) {
			url = "/view/create-document-template.html";
		}
		createDocumentHtml(url);
	})
}

function prefillDocument() {
	let url = "/embed-html/"+localStorage.templateId+".html";
	fetch(url).then((response) => {
		if (!response.ok) {
			url = "/view/create-document-template.html";
		}
		createDocumentHtml(url);
	})
}

function createDocumentHtml(url){
	window.open(url,'Create Document');
}

function reqGetRecipientList(dfile){
	let recipientList = "/data/"+dfile;
	console.log("\nRequest: Recipient List>\n" + home+recipientList);
	massData = "";
	fetch(recipientList)
	.then((response) => response.json())
	.then((gdata) => {
		let data = gdata.recipients;
		let grid = $('#grid').grid({
			dataSource: data,
			primaryKey: 'name',
			columns: [
				{ field: 'name', title: resource[localStorage.lang].SVC_RECIPIENT_LIST_NAME, width: 100, sortable: true },
				{ field: 'email', title: resource[localStorage.lang].SVC_RECIPIENT_LIST_EMAIL, width: 170, sortable: true },
				{ field: 'mobile', title: resource[localStorage.lang].SVC_RECIPIENT_LIST_MOBILE, width: 120, sortable: true },
				{ field: 'data', title: resource[localStorage.lang].SVC_RECIPIENT_LIST_DATA, width: 300, sortable: true },
			],
			selectionType: 'multiple',
			selectionMethod: 'checkbox',
			pager: { limit: 10 }
			//fixedHeader: true
		});
		$('#btnRemove').on('click', function () {
			grid.destroy();
		});
		$('#btnClear').on('click', function () {
			grid.unSelectAll();
			massData = "";
			document.getElementById("message").innerHTML = "";
		});	
		$('#btnSelected').on('click', function () {
			let selections = grid.getSelections();
			localStorage.setItem("selectedRecipients", selections.join());
			document.getElementById("message").innerHTML = resource[localStorage.lang].SVC_RECIPIENT_LIST_SELECTED +selections.join();
			for (let i = 0; i < selections.length; i++) {
				for (let j=0; j < data.length; j++) {
					if (selections[i] === data[j].name) {
						localStorage.setItem("recipientName", data[j].name);
						localStorage.setItem("recipientEmail", data[j].email);
						localStorage.setItem("recipientMobile", data[j].mobile);
						localStorage.setItem("recipientData", data[j].data);
						addDocDataMass(data[j])
						.then((ddata) => {
							let tmp = JSON.stringify(ddata).slice(12);
							massData += tmp.slice(0,-1) + ",";
							if (i == selections.length -1) {
								return;
							}
						})
						.catch((error) => {
							document.getElementById("message").innerHTML = error;
						});
					}
				}
			}
		});
		document.getElementById("message").innerHTML = resource[localStorage.lang].SVC_RECIPIENT_LIST_RECEIVED;
	})
	.catch((error) => {
		document.getElementById("message").innerHTML = error;
	});
}

async function addDocDataMass(record){
	let docData = JSON.parse(JSON.stringify(document_option_create));
	let member = docData.document.recipients[0].member;
	member.name = record.name;
	member.id = record.email;
	member.sms.phone_number = record.mobile;
	docData.document.recipients[0].step_type = localStorage.stepType;
	if (record.data == "" || record.data == null) {
		return docData;
	}
	const ftype = record.data.split('.').pop();
	const response = await fetchPrefillData(record.data);
	if (response) {
		if (ftype == "fields") {
			console.log(response);
			docData.document.fields = response.fields;
		} else if (ftype == "params") {
			docData.document.parameters[0].value = JSON.stringify(response);
		}
	}
	return docData;
}

async function addDocData(){
	let docData = JSON.parse(JSON.stringify(document_option_create));
	let member = docData.document.recipients[0].member;
	let recipientData = localStorage.recipientData;
	member.name =  localStorage.recipientName;
	member.id = localStorage.recipientEmail;
	member.sms.phone_number = localStorage.recipientMobile;
	docData.document.recipients[0].step_type = localStorage.stepType;
	if (recipientData == "" || recipientData == null) {
		return docData;
	}
	const ftype = recipientData.split('.').pop();
	const response = await fetchPrefillData(recipientData);
	if (response) {
		if (ftype == "fields") {
			console.log(response);
			docData.document.fields = response.fields;
		} else if (ftype == "params") {
			docData.document.parameters[0].value = JSON.stringify(response);
		}
		console.log("\ndocument_option:\n" + JSON.stringify(docData));
	}
	return docData;
}

function postDocument(){
	console.log("\nRequest: Create document>\n");
	let docData = JSON.parse(JSON.stringify(document_option_create));
	addDocData()
	.then((data) => {
		docData =  JSON.stringify(data);
		reqPostDocuments("Single", docData);
	})
	.catch((error) => {
		document.getElementById("message").innerHTML = error;
	});
}

function postMassDocuments() {
	if(massData == "") {
		alert(resource[localStorage.lang].SVC_SELECT_RECIPIENT);
		return;
	}
	console.log("\nRequest: Create Bulk Documents>\n");
	let tmpData = JSON.parse(JSON.stringify(massData));
	massData = '{"documents": [' + tmpData;
	massData = massData.slice(0, -1);
	massData += '],"comment": "Bulk Send"}';
	reqPostDocuments('Mass', massData);
}

async function reqPostDocuments(type, data) {
	let docBody = JSON.stringify({
			'templateId': localStorage.templateId,
			'data': data
	});
	let msgtext;
	let reqUrl = apiUrl + "/post/documents";
	if (type=='Mass') reqUrl = apiUrl + "/post/mass_documents";
	console.log(reqUrl);
	console.log(localStorage.templateId);
	console.log(data);
	document.getElementById("message").innerHTML = resource[localStorage.lang].SVC_RECIPIENT_LIST_SENDING_REQUEST;
	return	fetch(reqUrl, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
			'Authorization': localStorage.access_token,
		},
		body: docBody
	})
	.then((response) => response.json())
	.then((json) => {
		console.log(JSON.stringify(json));
		msgtext = (json.code && json.code!='-1') ?  json.ErrorMessage : resource[localStorage.lang].SVC_RECIPIENT_LIST_SENT_REQUEST;
		document.getElementById("message").innerHTML = localStorage.selectedRecipients + " : " + msgtext;
		massData="";
	})
	.catch((error) => {
		document.getElementById("message").innerHTML = error;
		massData="";
	});
}

function previewDocument() {
    const url = "./preview-document.html";
	console.log("\nRequest: Embed API View>\n" + url);
	window.open(url,'View Document');
}

async function fetchPrefillData(path){
	if (path == "") return;
	console.log("\nRequest: Prefill data:\n" + path);
	const response = await fetch(path);
	const data = await response.json();
	if (response.ok) {
		return data;
	} else {
		console.log(response.status);
		return false;
	}
}

async function reqDeleteDocument(){
	let msgtext;
	console.log("\nRequest: Delete document>\n");
	let reqUrl = apiUrl + "/delete/documents?documentId="+ localStorage.documentId;
	console.log(reqUrl);
	fetch(reqUrl, {
		headers: {
			'Content-type': 'application/json',
			'Authorization': localStorage.getItem('access_token')
		}
	})
	.then((response) => response.json())
	.then((json) => {
		console.log(JSON.stringify(json));
		msgtext = (json.code =='-1') ? resource[localStorage.lang].SVC_DOC_LIST_DELETED : json.message;
		document.getElementById("message").innerHTML = msgtext;
		return true;
	})
	.catch((error) => {
		document.getElementById("message").innerHTML = error;
		return false;
	});
}

function reqDownloadDocument(){
	console.log("\nRequest: Download document>\n");
	let req = apiUrl + "/get/documents/download?documentId="+localStorage.documentId + "&documentName="+localStorage.documentName;
	console.log(req);
	fetch(req, {
		headers: {
			'Content-type': 'application/zip',
			'Authorization': localStorage.getItem('access_token')
		}
	})
	.then((response) => response.text())
	.then((text) => {
		console.log(text);
		document.getElementById("message").innerHTML = text;
		if (text.includes('Succ')) {
			let fname = text.substring(6, text.indexOf(','));
			download(downPath, fname);
		}
	})
	.catch((error) => {
		document.getElementById("message").innerHTML = error;
	});
}

function reqDownloadAttachments(pdf){
	console.log("\nRequest: Download attachments>\n");
	let req = apiUrl + "/get/documents/attachments?documentId="+localStorage.documentId + "&documentName="+localStorage.documentName+"_attach" + "&pdf="+pdf;
	console.log(req);
	fetch(req, {
		headers: {
			'Content-type': 'application/zip',
			'Authorization': localStorage.getItem('access_token')
		}
	})
	.then((response) => response.text())
	.then((text) => {
		console.log(text);
		document.getElementById("message").innerHTML = text;
		if (text.includes('Succ')) {
			let fname = text.substring(6, text.indexOf(','));
			download(downPath, fname);
		}
	})
	.catch((error) => {
		document.getElementById("message").innerHTML = error;
	});
}

function editTemplate() {
	const url = "./edit-template.html";
	console.log("\nRequest: Embed API Edit Template>\n" + url);
	window.open(url,'Edit Template');
}

function createTemplate() {
	const url = "./create-template.html";
	console.log("\nRequest: Embed API Create Template>\n" + url);
	window.open(url,'Crerate Template');
}

function createDocumentMyfile() {
	const url = "./create-document-myfile.html";
	console.log("\nRequest: Embed API Create Document from Myfile>\n" + url);
	window.open(url,'Crerate Document from Myfile');
}


function reqGetMembertList(member_all,include_field,include_delete,eb_name_search){
	console.log("Request: Member list>\n");
	let reqUrl = apiUrl + "/get/members";
	    reqUrl += "?member_all="+ member_all;
		reqUrl += "&include_field="+ include_field;
		reqUrl += "&include_delete="+ include_delete;
		reqUrl += "&eb_name_search="+ encodeURI(eb_name_search,"UTF-8");
	console.log(reqUrl);
	let doc = '[';
	fetch(reqUrl, {
		headers: {
			'Content-type': 'application/json',
			'Authorization': localStorage.getItem('access_token')
		}
	})
	.then((response) => response.json())
	.then((json) => {
		console.log(json);
		if(json.code == "4010001" || json.code == "4010004" || json.code == "4030009") {
			document.getElementById("message").innerHTML = json.ErrorMessage;
			return;
		}
		let data = json.members;
		let obj = JSON.parse(JSON.stringify(data));
		for (i in data){
			doc += "{";
			doc += "\"id\":\""+obj[i].id+"\",";
			doc += "\"name\":\""+obj[i].name+"\",";
			doc += "\"create_date\":"+obj[i].create_date+",";
			doc += "\"enabled\":\""+obj[i].enabled+"\",";
			doc += "\"isWithdrawal\":\""+obj[i].isWithdrawal+"\",";
			doc += "\"country_code\":\""+obj[i].contact.country_id+"\",";
			doc += "\"mobile\":\""+obj[i].contact.number+"\",";

			let r = obj[i].role[0];
			for (j=1; j<obj[i].role.length; j++){
				r += ", "+obj[i].role[j];
			}
			r = (r == undefined) ? '' : r;
			doc += "\"role\":\""+r+"\",";

			let g = obj[i].group[0];
			for (j=1; j<obj[i].group.length; j++){
				g += ", "+obj[i].group[j];
			}
			g = g ? g : "";
			doc += "\"group\":\""+g+"\",";

			doc += "\"deleted\":\""+obj[i].deleted+"\"";
			doc += "},";
		}
		doc += ']';
		doc = doc.replace(",]", "]");
		//console.log(doc);
		doc = JSON.parse(doc);
		
		let grid = $('#grid').grid({
			dataSource: doc,
			columns: [
				{ field: 'id', title: resource[localStorage.lang].SVC_MEMBER_LIST_ID, sortable: true, width:160 },
				{ field: 'name', title: resource[localStorage.lang].SVC_MEMBER_LIST_NAME, sortable: true, width:150 },
				{ field: 'create_date', title: resource[localStorage.lang].SVC_MEMBER_LIST_CREATED, type: 'date', sortable: true,  width:90},
				{ field: 'country_code', title: resource[localStorage.lang].SVC_MEMBER_LIST_COUNTRYCODE, sortable: true, width:60 },
				{ field: 'mobile', title: resource[localStorage.lang].SVC_MEMBER_LIST_MOBILE, sortable: true, width:100 },
				{ field: 'role', title: resource[localStorage.lang].SVC_MEMBER_LIST_ROLE, sortable: true, width:150 },
				{ field: 'group', title: resource[localStorage.lang].SVC_MEMBER_LIST_GROUP, sortable: true, width:100 },
				{ field: 'enabled', title: resource[localStorage.lang].SVC_MEMBER_LIST_ENABLED, sortable: true, width:60 },
				{ field: 'isWithdrawal', title: resource[localStorage.lang].SVC_MEMBER_LIST_WITHDRAWN, sortable: true, width:60 },
				{ field: 'deleted', title: resource[localStorage.lang].SVC_MEMBER_LIST_DELETED, sortable: true, width:70 }
			],
			selectionMethod: 'checkbox',
			pager: { limit: 10 }
			//fixedHeader: true
		});
		grid.on('rowSelect', function (e, $row, id, record) {
			localStorage.setItem("memebrId",record.id);
		});
		$('#btnRemove').on('click', function () {
			grid.destroy();
			document.getElementById("btnRemove").style.display = "hidden";
		});
		document.getElementById("message").innerHTML = resource[localStorage.lang].SVC_MEMBER_LIST_RECEIVED + "(" + json.members.length +")";
    });
}

function reqGetGroupList(include_member,include_field){
	console.log("Request: Group list>\n");
	let reqUrl = apiUrl + "/get/groups";
		reqUrl += "?include_member="+ include_member;
		reqUrl += "&include_field="+ include_field;
	console.log(reqUrl);
	let doc = '[';
	fetch(reqUrl, {
		headers: {
			'Content-type': 'application/json',
			'Authorization': localStorage.getItem('access_token')
		}
	})
	.then((response) => response.json())
	.then((json) => {
		console.log(json);
		if(json.code == "4010001" || json.code == "4010004" || json.code == "4030009") {
			document.getElementById("message").innerHTML = json.ErrorMessage;
			return;
		}
		let data = json.groups;
		let obj = JSON.parse(JSON.stringify(data));
		for (i in data){
			doc += "{";
			doc += "\"id\":\""+obj[i].id+"\",";
			doc += "\"name\":\""+obj[i].name+"\",";
			doc += "\"create_date\":"+obj[i].create_date+",";
			doc += "\"description\":\""+obj[i].description+"\",";
			
			let m = "";
			for (j=0; j<obj[i].members.length; j++){
				m += obj[i].members[j].id +', ';
			}
			m = (m == undefined) ? '' : m;
			doc += "\"member\":\""+m+"\"";
			doc += "},";
		}
		doc += ']';
		doc = doc.replace(",]", "]");
		//console.log(doc);
		doc = JSON.parse(doc);
		
		let grid = $('#grid').grid({
			dataSource: doc,
			columns: [
				{ field: 'id', title: resource[localStorage.lang].SVC_GROUP_LIST_ID, sortable: true, hidden: true},
				{ field: 'name', title: resource[localStorage.lang].SVC_GROUP_LIST_NAME, sortable: true, width:100 },
				{ field: 'create_date', title: resource[localStorage.lang].SVC_GROUP_LIST_CREATED, type: 'date', sortable: true,  width:80},
				{ field: 'member', title: resource[localStorage.lang].SVC_GROUP_LIST_MEMBER, sortable: true, width:150 },
				{ field: 'description', title: resource[localStorage.lang].SVC_GROUP_LIST_DESC, sortable: true, width:150 }
			],
			selectionMethod: 'checkbox',
			pager: { limit: 10 }
			//fixedHeader: true
		});
		$('#btnRemove').on('click', function () {
			grid.destroy();
			document.getElementById("btnRemove").style.display = "hidden";
		});
        document.getElementById("message").innerHTML = resource[localStorage.lang].SVC_GROUP_LIST_RECEIVED + "(" + json.groups.length +")";
    });
}

const download = (path, file) => {
    const anchor = document.createElement('a');
    anchor.href = path+"/"+file;
    anchor.download = file;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}; 

async function reqDeleteMember(){
	let msgtext;
	console.log("\nRequest: Delete Member>\n");
	let reqUrl = apiUrl + "/delete/member?memberId="+ localStorage.memberId;
	console.log(reqUrl);
	fetch(reqUrl, {
		headers: {
			'Content-type': 'application/json',
			'Authorization': localStorage.getItem('access_token')
		}
	})
	.then((response) => response.json())
	.then((json) => {
		console.log(JSON.stringify(json));
		msgtext = (json.code =='-1') ? resource[localStorage.lang].SVC_DOC_LIST_DELETED : json.message;
		document.getElementById("message").innerHTML = msgtext;
		return true;
	})
	.catch((error) => {
		document.getElementById("message").innerHTML = error;
		return false;
	});
}

function reqDocumentInfo(){
	let msgtext;
	console.log("\nRequest: DocumentInfo>\n");
	let reqUrl = apiUrl + "/get/document_info?documentId="+ localStorage.documentId;
	console.log(reqUrl);
	fetch(reqUrl, {
		headers: {
			'Content-type': 'application/json',
			'Authorization': localStorage.getItem('access_token')
		}
	})
	.then((response) => response.json())
	.then((json) => {
		console.log(json);
		let obj = json.histories;
		let info = "<pre>";
		info += "<b>Dcoument: </b>" + json.document_name + "<br>";
		info += "<b>Creator: </b>" +json.creator.name+ ", "+ json.creator.id +"<br>";
		info += "<b>Current Step: </b>"+ json.current_status.step_index + ", " + json.current_status.step_name;
		const recipient = json.current_status.step_recipients[0];
		if (recipient!=undefined) {
			const rtype = recipient.recipient_type == '1' ? '멤버' : '외부 사용자';
			info += "<br><b>Recipient: </b>"+ rtype +", "+recipient.name + ", ";
			if (recipient.email == undefined) {
				info += recipient.id;
			} else {
				info += recipient.email;
			}
		}
		info += "<br><b>Last Updator: </b>" +json.last_editor.name+ ", "+ json.last_editor.id +"<br>";
		info += "<b>History: </b><br>";
		for (let i=0; i< json.histories.length; i++) {
			let step, action;
			switch(json.histories[i].step_type){
				case '00': step = '시작	'; break;
				case '01': step = '완료	'; break;
				case '05': step = '참여자	'; break;
				case '06': step = '검토자	'; break;
				case '07': step = '열람자	'; break;
				default: step = json.histories[i].step_type; break;
			}
			switch(json.histories[i].action_type){
				case '001': action = '임시 저장		'; break;
				case '002': action = '문서 생성		'; break;
				case '003': action = '문서 완료		'; break;
				case '042': action = '문서 취소		'; break;
				case '043': action = '문서 수정		'; break;
				case '044': action = '수정 취소		'; break;
				case '049': action = '문서 삭제		'; break;
				case '060': action = '참여자 요청		'; break;
				case '061': action = '참여자 반려		'; break;
				case '062': action = '참여자 승인		'; break;
				case '064': action = '참여자 열람		'; break;
				case '070': action = '검토자 요청		'; break;
				case '074': action = '검토자 열람		'; break;
				case '075': action = '열람자 요청		'; break;
				case '076': action = '열람자 열람		'; break;
				default: action = json.histories[i].action_type; break;
			}
			info += '&emsp;&emsp;';
			info += '<span style="color: blue;">'+step+'</span>';
			info += '<span style="color: purple;">'+action+'</span>';
			info += json.histories[i].executor.name + '	';
			info += json.histories[i].executor.id + '	';
			info += new Date(json.histories[i].executed_date).toLocaleString()+"<br>";
		}
		info += "</pre>";
		document.getElementById('history').innerHTML =  info;
		msgtext = (json.code =='200') ? resource[localStorage.lang].SVC_DOCINFO_RECEIVED : json.ErrorMessage;
	})
	.catch((error) => {
		document.getElementById("message").innerHTML = error;
	});
}

function reqSaveDocumentId(docid, name, email){
	console.log("\nRequest: Save DocumentId>\n");
	let reqUrl = apiUrl + "/post/outside_token?docid="+ docid + "&name="+name+ "&email="+email;
	console.log(reqUrl);
	fetch(reqUrl, {
		headers: {
			'Content-type': 'application/json',
			'Authorization': localStorage.getItem('access_token')
		}
	})
	.then((response) => response.text())
	.then((text) => {
		document.getElementById("message").innerHTML = text;
		return true;
	})
	.catch((error) => {
		document.getElementById("message").innerHTML = error;
		return false;
	});
}
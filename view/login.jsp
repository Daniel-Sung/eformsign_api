<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" autoFlush="true"
    import="java.io.*,java.util.*,java.sql.*,sun.misc.*,java.net.URLEncoder" %>
<%
String language = request.getParameter("language");
language = "ja";
String loginId = request.getParameter("loginId");
String passwd = request.getParameter("passwd");
String url = "jdbc:mysql://localhost:3306/eformsign" + "?useUnicode=true&characterEncoding=utf8";

Connection conn;
Statement stmt;
String sql = "SELECT passwd, memberid FROM account WHERE loginId ='" + loginId + "'";

Class.forName("com.mysql.cj.jdbc.Driver");
conn = DriverManager.getConnection(url, "root", "kjm@6595");
stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery(sql);

String pwd="", mid="", target="";
while(rs.next()){
	pwd=rs.getString("passwd");
    mid=rs.getString("memberid");
}
conn.close();
if(pwd.equals(passwd) && mid.length()>0) {
    target = new String("./template-list.html?memberId="+mid+"&language="+language);
} else {
    target = new String("/index.html?memberId=none&language="+language);
}
response.sendRedirect(target);
%>

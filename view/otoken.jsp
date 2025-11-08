<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" autoFlush="true"
    import="java.io.*,java.util.*,java.sql.*,sun.misc.*,java.net.URLEncoder" %>
<%
String docid = request.getParameter("docid");
String name = request.getParameter("name");
String email = request.getParameter("email");
String url = "jdbc:mysql://localhost:3306/eformsign" + "?useUnicode=true&characterEncoding=utf8";
int ret = 0;
Connection conn;
PreparedStatement pstmt;
String mysqlpass = System.getenv("mysqlpass");
String sql = "INSERT INTO token (document_id, name, email) VALUES ( ?, ?, ?)";
Class.forName("com.mysql.cj.jdbc.Driver");
conn = DriverManager.getConnection(url, "root", mysqlpass);
pstmt = conn.prepareStatement(sql);
pstmt.setString(1, docid);
pstmt.setString(2, name);
pstmt.setString(3, email);
ret = pstmt.executeUpdate();
pstmt.close();
conn.close();
%>

package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/skip-to-content")
public class SkipToContentServlet extends HttpServlet {

 /**
  * Given the correlator, this will update the database to reflect that the user clicked 'skip to content'.
  *
  * @param  request  This includes a correlator for the current user.
  * @param  response An empty 200 response 
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");
    response.getWriter().println("<h1>Skip to Content</h1>");
  }
}
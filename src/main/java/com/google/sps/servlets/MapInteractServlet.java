package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/map-interact")
public class MapInteractServlet extends HttpServlet {

 /**
  * Given the correlator, this will update the database to reflect that the user interacted with the map.
  *
  * @param  request  This includes a correlator for the current user.
  * @param  response An empty 200 response 
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");
    response.getWriter().println("<h1>Map Interact</h1>");
  }
}
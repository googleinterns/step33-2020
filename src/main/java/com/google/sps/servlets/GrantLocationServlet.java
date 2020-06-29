package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.sps.servlets.Constants;

@WebServlet("/grant-location")
public class GrantLocationServlet extends HttpServlet {

 /**
  * Given the correlator, this will update the database to reflect that the user
  * allowed their location to be accessed.
  *
  * request - This includes a correlator of type String for the current user.
  * response - An empty 200 response 
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
 
    final String correlator = request.getParameter("correlator");

    if (correlator == null) {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    Constants.updateDatabase(correlator, "grantsLocation");

    response.setStatus(HttpServletResponse.SC_OK); 
  }
}
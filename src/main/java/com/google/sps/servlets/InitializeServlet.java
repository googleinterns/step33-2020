
package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/initialize")
public class InitializeServlet extends HttpServlet {

 /**
  * Given the correlator, this will create an entry in the database with default values.
  *
  * @param  request  This includes a correlator for the current user.
  * @param  response An empty 200 response 
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setStatus(HttpServletResponse.SC_OK); 
  }
}
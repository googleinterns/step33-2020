package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.sps.servlets.DBUtilities;
import com.google.sps.servlets.Property;

@WebServlet("/skip-to-content")
public class SkipToContentServlet extends HttpServlet {

 /**
  * Given the correlator, this will update the database to reflect that the user
  * clicked 'skip to content'.
  *
  * @param request This includes a correlator for the current user.
  * @param response A 200 status or 400 error
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    final String correlator = DBUtilities.getCorrelator(request);

    if (correlator.isEmpty()) {
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    DBUtilities.setToTrue(correlator, Property.SKIP_TO_CONTENT);

    response.setStatus(HttpServletResponse.SC_OK);
  }
}
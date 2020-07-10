package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.sps.servlets.DBUtilities;
import com.google.sps.servlets.Property;
import com.google.sps.servlets.RequestUtils;

@WebServlet("/map-interact")
public class MapInteractServlet extends HttpServlet {

 /**
  * Given the correlator, this will update the database to reflect that the user
  * interacted with the map.
  *
  * @param request This includes a correlator for the current user.
  * @param response A 200 status or 400 error.
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    final String correlator = RequestUtils.getParameter(request, Property.CORRELATOR);

    if (correlator.isEmpty()) {
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    DBUtilities.setToTrue(correlator, Property.INTERACTS_WITH_MAP);

    response.setStatus(HttpServletResponse.SC_OK); 
  }
}
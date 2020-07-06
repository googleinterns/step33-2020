package com.google.sps.servlets;

import com.google.gson.Gson;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/dashboard")
public class DashboardServlet extends HttpServlet {

 /**
  * Given the correlator, this will create an entry in the database with default
  * values.
  *
  * @param request This includes a correlator for the current user.
  * @param response A 200 status or 400 error.
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        
    final String correlator = RequestUtils.getCorrelator(request);

    if (correlator.isEmpty()) {
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    Entity interaction = new Entity(DBUtilities.INTERACTION_TABLE);
    interaction.setProperty(Property.CORRELATOR, correlator);
    interaction.setProperty(Property.FIND_NEAREST_LOCATION, false);
    interaction.setProperty(Property.GRANTS_LOCATION, false);
    interaction.setProperty(Property.INTERACTS_WITH_MAP, false);
    interaction.setProperty(Property.SKIP_TO_CONTENT, false);
    interaction.setProperty(Property.RETURN_TO_AD, false);

    DatastoreService dataStore = DatastoreServiceFactory.getDatastoreService();
    dataStore.put(interaction);

    response.setStatus(HttpServletResponse.SC_OK); 
  }
}
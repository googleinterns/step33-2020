
package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.sps.servlets.DBUtilities;
import com.google.sps.servlets.Property;

@WebServlet("/initialize")
public class InitializeServlet extends HttpServlet {

 /**
  * Given the correlator, this will create an entry in the database with default
  * values.
  *
  * request - This includes a correlator of type String for the current user.
  * response - An empty 200 response 
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        
    final String correlator = DBUtilities.getCorrelator(request);

    if (correlator.isEmpty()) {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    Entity impressions = new Entity(DBUtilities.INTERACTION_TABLE);
    impressions.setProperty(Property.CORRELATOR, correlator);
    impressions.setProperty(Property.FIND_NEAREST_LOCATION, false);
    impressions.setProperty(Property.GRANTS_LOCATION, false);
    impressions.setProperty(Property.INTERACTS_WITH_MAP, false);
    impressions.setProperty(Property.SKIP_TO_CONTENT, false);
    impressions.setProperty(Property.RETURN_TO_AD, false);

    DatastoreService dataStore = DatastoreServiceFactory.getDatastoreService();
    dataStore.put(impressions);

    response.setStatus(HttpServletResponse.SC_OK); 
  }
}
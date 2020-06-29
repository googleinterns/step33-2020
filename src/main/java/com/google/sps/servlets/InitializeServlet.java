
package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.sps.servlets.Shared;

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
        
    final String correlator = Shared.getCorrelator(request);

    if (correlator.isEmpty()) {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    Entity impressions = new Entity("Impressions");
    impressions.setProperty("correlator", correlator);
    impressions.setProperty("clicksFindNearestLocation", false);
    impressions.setProperty("grantsLocation", false);
    impressions.setProperty("interactsWithMap", false);
    impressions.setProperty("clicksSkipToContent", false);
    impressions.setProperty("clicksReturnToAd", false);

    DatastoreService dataStore = DatastoreServiceFactory.getDatastoreService();
    dataStore.put(impressions);

    response.setStatus(HttpServletResponse.SC_OK); 
  }
}
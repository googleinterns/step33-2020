package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/skip-to-content")
public class SkipToContentServlet extends HttpServlet {

 /**
  * Given the correlator, this will update the database to reflect that the user
  * clicked 'skip to content'.
  *
  * request - This includes a correlator of type String for the current user.
  * response - An empty 200 response 
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        
    String correlator = request.getParameter("correlator");

    //TODO: find a more graceful way to handle this
    if (correlator == null){
      throw new IOException();
    }
    
    Filter correlatorFilter =  new FilterPredicate("correlator", FilterOperator.EQUAL, correlator);
    Query impressionQuery = new Query("Impressions").setFilter(correlatorFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery filteredImpression = datastore.prepare(impressionQuery);

    //only runs once
    for (Entity impression : filteredImpression.asIterable()) {
      impression.setProperty("clicksSkipToContent", true);
      datastore.put(impression);  //override the existing entity
    }

    response.setStatus(HttpServletResponse.SC_OK); 
  }
}
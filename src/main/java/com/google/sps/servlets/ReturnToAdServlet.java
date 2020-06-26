package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;

@WebServlet("/return-to-ad")
public class ReturnToAdServlet extends HttpServlet {

 /**
  * Given the correlator, this will update the database to reflect that the user
  * clicked 'return to ad'.
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
      impression.setProperty("clicksReturnToAd", true);
      datastore.put(impression);  //override the existing entity
    }

    response.setStatus(HttpServletResponse.SC_OK); 
  }
}
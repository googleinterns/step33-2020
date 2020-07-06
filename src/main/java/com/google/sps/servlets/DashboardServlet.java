package com.google.sps.servlets;

import com.google.gson.Gson;
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
    Query interactionQuery = new Query(DBUtilities.INTERACTION_TABLE);
    
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery interactions = datastore.prepare(interactionQuery);

    int findNearestLocationCounter = 0;
    int grantsLocationCounter = 0;
    int interactsWithMapCounter = 0;
    int skipToContentCounter = 0;
    int returnToAdCounter = 0;
    
    for (Entity entity : interactions.asIterable()) {
      System.out.println(entity);
    }
  }
}
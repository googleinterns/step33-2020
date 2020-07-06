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
import com.google.sps.servlets.Property;
import java.util.HashMap;

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
      findNearestLocationCounter = (boolean) entity.getProperty(Property.FIND_NEAREST_LOCATION) ? ++findNearestLocationCounter : findNearestLocationCounter;
      grantsLocationCounter = (boolean) entity.getProperty(Property.GRANTS_LOCATION) ? ++grantsLocationCounter : grantsLocationCounter;
      interactsWithMapCounter = (boolean) entity.getProperty(Property.INTERACTS_WITH_MAP) ? ++interactsWithMapCounter : interactsWithMapCounter;
      skipToContentCounter = (boolean) entity.getProperty(Property.SKIP_TO_CONTENT) ? ++skipToContentCounter : skipToContentCounter;
      returnToAdCounter = (boolean) entity.getProperty(Property.RETURN_TO_AD) ? ++returnToAdCounter : returnToAdCounter;
    }

    HashMap<String, Integer> countPercentages = new HashMap<>();

    int totalInteractions = interactions.countEntities();
    countPercentages.put(Property.FIND_NEAREST_LOCATION, findNearestLocationCounter/totalInteractions);
    countPercentages.put(Property.GRANTS_LOCATION, grantsLocationCounter/totalInteractions);
    countPercentages.put(Property.INTERACTS_WITH_MAP, interactsWithMapCounter/totalInteractions);
    countPercentages.put(Property.SKIP_TO_CONTENT, skipToContentCounter/totalInteractions);
    countPercentages.put(Property.RETURN_TO_AD, returnToAdCounter/totalInteractions);
    
    String jsonToSend = convertToJson(countPercentages);

    response.setContentType("application/json; charset=UTF-8");
    response.getWriter().println(jsonToSend);

  }

  private String convertToJson(HashMap<String, Integer> data) {
    Gson gson = new Gson();
    String json = gson.toJson(data);
    return json;
  }
}
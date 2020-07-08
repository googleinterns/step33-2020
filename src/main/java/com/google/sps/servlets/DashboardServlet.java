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
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.sps.servlets.Property;
import java.util.HashMap;

@WebServlet("/dashboard")
public class DashboardServlet extends HttpServlet {

 /**
  * This route will return a JSON with the percentages of each interaction
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query interactionQuery = new Query(DBUtilities.INTERACTION_TABLE);
    
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery interactions = datastore.prepare(interactionQuery);

    Field[] allProperties = Property.class.getDeclaredFields();
    double totalInteractions = interactions.countEntities();
    HashMap<String, Double> countPercentages = new HashMap<>();

    for (Field property : allProperties) {
      Filter keyFilter =  new FilterPredicate(property, FilterOperator.EQUAL, true);
      Query filteredQuery = new Query(DBUtilities.INTERACTION_TABLE).setFilter(keyFilter);
    
      int numUsersInteracted = datastore.prepare(filteredQuery).countEntities();
      countPercentages.put(property, numUsersInteracted / totalInteractions);
    }
    
    String jsonToSend = convertToJson(countPercentages);

    response.setContentType("application/json; charset=UTF-8");
    response.getWriter().println(jsonToSend);

  }

  private String convertToJson(HashMap<String, Double> data) {
    Gson gson = new Gson();
    String json = gson.toJson(data);
    return json;
  }
}
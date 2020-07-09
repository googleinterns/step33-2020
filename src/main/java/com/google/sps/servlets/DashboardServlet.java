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
import java.lang.reflect.Field; 
import java.util.HashMap;
import com.google.sps.servlets.RequestUtils;

@WebServlet("/dashboard")
public class DashboardServlet extends HttpServlet {

 /**
  * This route will return a JSON with the percentages of each interaction
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    final long SECONDS_IN_DAY = 86400;

    final String startTimestamp = RequestUtils.getParameter(request, Property.TIMESTAMP);
    final String endTimestamp = (String) (Long.valueOf(startTimestamp) + SECONDS_IN_DAY);
    
    try {
      HashMap<String, Double> interactionPercentages = calculatePercentages(startTimestamp, endTimestamp);
      
      String jsonToSend = convertToJson(interactionPercentages);

      response.setContentType("application/json; charset=UTF-8");
      response.getWriter().println(jsonToSend);
    
    } catch (IllegalAccessException exception) {
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }
  }

 /**
  * This function queries for and calculates the percentages of each interaction.
  * @return A hashmap with the interactions as keys and the percentages as values.
  */
  public HashMap<String, Double> calculatePercentages(String startTimestamp, String endTimestamp) throws IllegalAccessException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery interactions = datastore.prepare(new Query(DBUtilities.INTERACTION_TABLE));

    Field[] allFields = Property.class.getDeclaredFields();
  
    HashMap<String, Double> interactionPercentages = new HashMap<>();

    for (Field field : allFields) {
      String property = (String) field.get(new Property()); // gets the value of the field variable

      Filter keyFilter =  new FilterPredicate(property, FilterOperator.EQUAL, true);
      Query filteredQuery = new Query(DBUtilities.INTERACTION_TABLE).setFilter(keyFilter);
    
      int numUsersInteracted = datastore.prepare(filteredQuery).countEntities();
      int totalInteractions = interactions.countEntities();

      interactionPercentages.put(property, numUsersInteracted / (double) totalInteractions);
    }

    return interactionPercentages;
  }

  private String convertToJson(HashMap<String, Double> data) {
    Gson gson = new Gson();
    String json = gson.toJson(data);
    return json;
  }
}
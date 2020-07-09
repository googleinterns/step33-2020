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
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.sps.servlets.Property;
import java.lang.reflect.Field; 
import java.util.HashMap;
import com.google.sps.servlets.RequestUtils;

@WebServlet("/dashboard")
public class DashboardServlet extends HttpServlet {

  private final long SECONDS_IN_DAY = 86400;
  private final String DEFAULT_START_TIMESTAMP = "0";
  private final String DEFAULT_END_TIMESTAMP = String.valueOf(System.currentTimeMillis());

 /**
  * This route will return a JSON with the percentages of each interaction
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    String startTimestamp = RequestUtils.getParameter(request, Property.TIMESTAMP);
    String endTimestamp;

    if (startTimestamp.isEmpty()) {
      startTimestamp = DEFAULT_START_TIMESTAMP;
      endTimestamp = DEFAULT_END_TIMESTAMP;
    } else {
      endTimestamp = String.valueOf(Long.valueOf(startTimestamp) + SECONDS_IN_DAY);
    }
    
    try {
      HashMap<String, Double> dataToSend = calculatePercentages(startTimestamp, endTimestamp);
      
      String jsonToSend = convertToJson(dataToSend);

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

    final Filter startTimestampFilter =  new FilterPredicate(Property.TIMESTAMP, FilterOperator.GREATER_THAN_OR_EQUAL, startTimestamp);
    final Filter endTimestampFilter =  new FilterPredicate(Property.TIMESTAMP, FilterOperator.LESS_THAN_OR_EQUAL, endTimestamp);
    
    final Query timedQuery = new Query(DBUtilities.INTERACTION_TABLE).setFilter(CompositeFilterOperator.and(startTimestampFilter, endTimestampFilter));
    PreparedQuery interactions = datastore.prepare(timedQuery);

    Field[] allFields = Property.class.getDeclaredFields();
  
    HashMap<String, Double> dataToSend = new HashMap<>();

    // skip the timestamp and correlator properties
    for (int i = 2; i < allFields.length; ++i){
      String property = (String) allFields[i].get(new Property()); // gets the value of the field variable

      Filter propertyFilter =  new FilterPredicate(property, FilterOperator.EQUAL, true);
      Query filteredQuery = new Query(DBUtilities.INTERACTION_TABLE);
      filteredQuery.setFilter(CompositeFilterOperator.and(propertyFilter, startTimestampFilter, endTimestampFilter));

      int numUsersInteracted = datastore.prepare(filteredQuery).countEntities();
      int totalInteractions = interactions.countEntities();

      double percentage;
      if (totalInteractions == 0) {
        percentage = 0;
      } else {
        percentage = numUsersInteracted / (double) totalInteractions;
      }

      dataToSend.put(property, percentage);
    }

    dataToSend.put("totalInteractions", (double) interactions.countEntities());
    
    return dataToSend;
  }

  private String convertToJson(HashMap<String, Double> data) {
    Gson gson = new Gson();
    String json = gson.toJson(data);
    return json;
  }
}
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
import java.util.HashMap;
import java.util.ArrayList;
import com.google.sps.servlets.RequestUtils;

@WebServlet("/dashboard")
public class DashboardServlet extends HttpServlet {

  private final long MILLISECONDS_IN_DAY = 86400000;
  
  private final String[] searchableProperties = new String[] {
    Property.FIND_NEAREST_LOCATION, 
    Property.GRANTS_LOCATION, 
    Property.INTERACTS_WITH_MAP, 
    Property.SKIP_TO_CONTENT, 
    Property.RETURN_TO_AD
  };

 /**
  * This route will return a JSON with the percentages of each interaction
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    String requestStartTimestamp = RequestUtils.getParameter(request, "startTime");
    String requestEndTimestamp = RequestUtils.getParameter(request, "endTime");

    ArrayList<String> validatedTimestamps = validateTimestamps(requestStartTimestamp, requestEndTimestamp);    
    String validatedStartTimestamp = validatedTimestamps.get(0);
    String validatedEndTimestamp = validatedTimestamps.get(1);

    try {
      HashMap<String, Double> dataToSend = calculatePercentages(validatedStartTimestamp, validatedEndTimestamp);
      
      String jsonToSend = convertToJson(dataToSend);

      response.setStatus(HttpServletResponse.SC_OK);
      response.setContentType("application/json; charset=UTF-8");
      response.getWriter().println(jsonToSend);
    
    } catch (IllegalAccessException exception) {

      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }
  }

 /**
  * This function queries for and calculates the percentages of each
  * interaction.
  *
  * @param startTimestamp Timestamp for the beginning of the date range that is requested.
  * @param endTimestamp Timestamp for the end of the date range that is requested.
  * @return A hashmap with the interactions as keys and the percentages as values.
  */
  private HashMap<String, Double> calculatePercentages(String startTimestamp, String endTimestamp) throws IllegalAccessException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    final Filter startTimestampFilter =  new FilterPredicate(Property.TIMESTAMP, FilterOperator.GREATER_THAN_OR_EQUAL, startTimestamp);
    final Filter endTimestampFilter =  new FilterPredicate(Property.TIMESTAMP, FilterOperator.LESS_THAN_OR_EQUAL, endTimestamp);
    
    final Query timedQuery = new Query(DBUtilities.INTERACTION_TABLE).setFilter(CompositeFilterOperator.and(startTimestampFilter, endTimestampFilter));
    PreparedQuery interactions = datastore.prepare(timedQuery);  
  
    HashMap<String, Double> dataToSend = new HashMap<>();

    for (int i = 0; i < searchableProperties.length; ++i){
      String property = searchableProperties[i];

      Filter propertyFilter =  new FilterPredicate(property, FilterOperator.EQUAL, true);
      Query filteredQuery = new Query(DBUtilities.INTERACTION_TABLE);
      filteredQuery.setFilter(CompositeFilterOperator.and(propertyFilter, startTimestampFilter, endTimestampFilter));

      int numUsersInteracted = datastore.prepare(filteredQuery).countEntities();
      int totalInteractions = interactions.countEntities();

      double percentage = totalInteractions == 0 ? 0 : numUsersInteracted / (double) totalInteractions;

      dataToSend.put(property, percentage);
    }

    dataToSend.put("totalInteractions", (double) interactions.countEntities());
    
    return dataToSend;
  }

 /**
  * Given the data to convert to json, this function returns a json
  * representation.
  *
  * @param data A hashmap from a string to a double to be converted to a json format.
  * @return A json representation of the input data.
  */
  private String convertToJson(HashMap<String, Double> data) {
    Gson gson = new Gson();
    String json = gson.toJson(data);
    return json;
  }

 /**
  * Given the start and end timestamps requested, this function validates and sets 
  * the instance variables.
  *
  * @param startTimestamp A string containing the requested start time as a UNIX timestamp
  * @param endTimestamp A string containing the requested end time as a UNIX timestamp
  * @return An arraylist with two entries - one for each validated start/end time
  */
  private ArrayList<String> validateTimestamps(String requestStartTimestamp, String requestEndTimestamp){

    ArrayList<String> validatedTimestamps = new ArrayList<>();

    if (requestStartTimestamp.isEmpty() || requestEndTimestamp.isEmpty()) {
      String startTimestamp = "0";
      String endTimestamp = String.valueOf(System.currentTimeMillis());

      validatedTimestamps.add(startTimestamp);
      validatedTimestamps.add(endTimestamp);
    } else {  
      String startTimestamp = requestStartTimestamp;
      String endTimestamp = requestEndTimestamp;
    
      // When displaying the range of dates, the latter date is included
      endTimestamp = String.valueOf(Long.valueOf(endTimestamp) + MILLISECONDS_IN_DAY);
      
      validatedTimestamps.add(startTimestamp);
      validatedTimestamps.add(endTimestamp);
    }

    return validatedTimestamps;
  }
}
package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;

public class Shared {

  public final String CORRELATOR = "correlator";
  public final String FIND_NEAREST_LOCATION = "clicksFindNearestLocation";
  public final String GRANTS_LOCATION = "grantsLocation";
  public final String INTERACTS_WITH_MAP = "interactsWithMap";
  public final String SKIP_TO_CONTENT = "clicksSkipToContent";
  public final String RETURN_TO_AD = "clicksReturnToAd";

  public static String getCorrelator(HttpServletRequest request) {
    String correlator = request.getParameter(CORRELATOR);

    if (correlator == null) {
      return "";
    }

    return correlator;
  }
 
  public static void updateDatabase(String correlator, String propertyToUpdate) {
    
    final Filter correlatorFilter =  new FilterPredicate(CORRELATOR, FilterOperator.EQUAL, correlator);
    final Query impressionQuery = new Query("Impressions").setFilter(correlatorFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery filteredImpression = datastore.prepare(impressionQuery);

    for (Entity impression : filteredImpression.asIterable()) {
      impression.setProperty(propertyToUpdate, true);
      datastore.put(impression);  // override the existing entity
    }
  }
}